const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Normalize client shipping payload to Order.shippingAddress shape.
 * Accepts `address` (storefront checkout) or `street` (legacy / admin).
 */
function normalizeShippingAddress(body, userDoc) {
  const s = body && typeof body === 'object' ? body : {};
  const line =
    (typeof s.address === 'string' && s.address.trim()) ||
    (typeof s.street === 'string' && s.street.trim()) ||
    (typeof s.line1 === 'string' && s.line1.trim()) ||
    '';
  const state = typeof s.state === 'string' ? s.state.trim() : '';
  const addressLine = line && state ? `${line}, ${state}` : line || state;

  const fullName =
    (typeof s.fullName === 'string' && s.fullName.trim()) ||
    (userDoc && `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim()) ||
    '';

  const city = typeof s.city === 'string' ? s.city.trim() : '';
  const postalCode =
    (typeof s.postalCode === 'string' && s.postalCode.trim()) ||
    (typeof s.zipCode === 'string' && s.zipCode.trim()) ||
    '';
  const country = typeof s.country === 'string' ? s.country.trim() : '';
  const phone =
    (typeof s.phone === 'string' && s.phone.trim()) ||
    (userDoc && userDoc.phone ? String(userDoc.phone).trim() : '') ||
    '';

  if (!addressLine || !city || !postalCode || !country || !phone || !fullName) {
    return null;
  }

  return {
    fullName,
    address: addressLine,
    city,
    postalCode,
    country,
    phone,
  };
}

/**
 * @desc    Get all orders (filtered by vendor if vendor role)
 * @route   GET /api/orders
 * @access  Private
 */
const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      orderStatus = '',
      paymentStatus = '',
      invoiceStatus = '',
    } = req.query;

    const query = {};

    // If vendor, only show orders with their products
    if (req.user && req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    // Search filter
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Status filters
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (invoiceStatus) {
      query.invoiceStatus = invoiceStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

function escapeRegex(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @desc    Track order by order number + email (guest-safe)
 * @route   GET /api/orders/track
 * @access  Public
 */
const trackOrder = async (req, res, next) => {
  try {
    const orderNumber = (req.query.orderNumber || '').trim();
    const email = (req.query.email || '').trim().toLowerCase();

    if (!orderNumber || !email) {
      throw new ApiError(400, 'Order number and email are required');
    }

    const order = await Order.findOne({
      orderNumber: new RegExp(`^${escapeRegex(orderNumber)}$`, 'i'),
    }).populate('customer', 'email');

    if (!order || !order.customer) {
      throw new ApiError(404, 'No order matches those details. Check your order number and email.');
    }

    const custEmail = String(order.customer.email || '').trim().toLowerCase();
    if (custEmail !== email) {
      throw new ApiError(404, 'No order matches those details. Check your order number and email.');
    }

    await order.populate('items.product', 'name images sku');

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };

    if (req.user.role === 'user') {
      query.customer = req.user.id;
    } else if (req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    const order = await Order.findOne(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images sku');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update invoice status
 * @route   PUT /api/orders/:id/invoice-status
 * @access  Private (Admin, Vendor)
 */
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { invoiceStatus } = req.body;

    if (!invoiceStatus || !['pending', 'hold', 'complete', 'shipment', 'cancelled'].includes(invoiceStatus)) {
      throw new ApiError(400, 'Invalid invoice status');
    }

    const query = { _id: id };

    // If vendor, only allow updating orders with their products
    if (req.user && req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    const order = await Order.findOne(query);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.invoiceStatus = invoiceStatus;
    
    // Update orderStatus based on invoiceStatus
    if (invoiceStatus === 'complete') {
      order.orderStatus = 'delivered';
      order.deliveredAt = new Date();
    } else if (invoiceStatus === 'shipment') {
      order.orderStatus = 'shipped';
    } else if (invoiceStatus === 'cancelled') {
      order.orderStatus = 'cancelled';
    } else if (invoiceStatus === 'hold') {
      order.orderStatus = 'pending';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin, Vendor)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus || !['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'hold'].includes(orderStatus)) {
      throw new ApiError(400, 'Invalid order status');
    }

    const query = { _id: id };

    // If vendor, only allow updating orders with their products
    if (req.user && req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    const order = await Order.findOne(query);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    const userDoc = await User.findById(req.user.id).select('firstName lastName phone');
    const normalizedShipping = normalizeShippingAddress(shippingAddress, userDoc);
    if (!normalizedShipping) {
      throw new ApiError(
        400,
        'Valid shipping address is required (full name, address, city, postal code, country, phone)'
      );
    }

    // Cash on delivery only for now
    const method = String(paymentMethod || 'cash_on_delivery').toLowerCase().replace(/-/g, '_');
    if (method !== 'cash_on_delivery') {
      throw new ApiError(400, 'Only cash on delivery is available at this time');
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item.id);
      
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.product || item.id}`);
      }

      if (!product.isActive) {
        throw new ApiError(400, `Product is not available: ${product.name}`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
      }

      const price = product.salePrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      const img = (product.images && product.images[0]) ? product.images[0] : '/placeholder.jpg';

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        image: img,
      });

      // Update product stock
      product.stock -= item.quantity;
      product.soldCount = (product.soldCount || 0) + item.quantity;
      await product.save();
    }

    const shippingCost =
      shippingMethod === 'express'
        ? 15
        : shippingMethod === 'next-day'
          ? 25
          : subtotal >= 50
            ? 0
            : 5.99;

    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress: normalizedShipping,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderStatus: 'processing',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name slug images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer's own orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;

    const query = { customer: req.user.id };
    
    if (status) {
      query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  getMyOrders,
  trackOrder,
  updateInvoiceStatus,
  updateOrderStatus,
};
