const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getAnalytics = async (req, res, next) => {
  res.json({ success: true, message: 'Analytics controller - coming soon', data: {} });
};

const getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy = {};
    let matchDate = {};
    
    if (period === 'month') {
      // Group by month for the last 12 months
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      matchDate = { createdAt: { $gte: startDate } };
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    } else if (period === 'week') {
      // Group by week for the last 12 weeks
      const now = new Date();
      const startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
      matchDate = { createdAt: { $gte: startDate } };
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      };
    } else {
      // Group by day for the last 30 days
      const now = new Date();
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchDate = { createdAt: { $gte: startDate } };
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    }

    // Build match query
    let matchQuery = {
      ...matchDate,
      orderStatus: { $in: ['delivered', 'shipped', 'processing'] },
      paymentStatus: { $in: ['paid'] },
    };

    // If vendor, filter by vendor's products
    if (req.user && req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      matchQuery['items.product'] = { $in: productIds };
    }

    const salesData = await Order.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 },
      },
    ]);

    // Format the data for the chart
    const formattedData = salesData.map((item) => {
      let label = '';
      if (period === 'month') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      } else if (period === 'week') {
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else {
        label = `${item._id.month}/${item._id.day}/${item._id.year}`;
      }
      return {
        ...item._id,
        month: label,
        totalSales: item.totalSales,
        orderCount: item.orderCount,
      };
    });

    res.json({
      success: true,
      data: {
        salesData: formattedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductAnalytics = async (req, res, next) => {
  try {
    // Build product query
    let productQuery = {};

    // If vendor, filter by vendor's products
    if (req.user && req.user.role === 'vendor') {
      productQuery.vendor = req.user.id;
    }

    // Top selling products
    const topProducts = await Product.find(productQuery)
      .sort({ soldCount: -1 })
      .limit(10)
      .select('name price soldCount sku');

    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $match: productQuery,
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1,
        },
      },
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({ ...productQuery, stock: { $lte: 10 } })
      .select('name sku stock')
      .sort({ stock: 1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        topProducts,
        productsByCategory,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get current date range for monthly revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Build base match query
    let orderMatchQuery = {
      orderStatus: { $in: ['delivered', 'shipped', 'processing'] },
      paymentStatus: { $in: ['paid'] },
    };

    let orderQuery = {};
    let productQuery = {};

    // If vendor, filter by vendor's products
    if (req.user && req.user.role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      
      orderMatchQuery['items.product'] = { $in: productIds };
      orderQuery['items.product'] = { $in: productIds };
      productQuery.vendor = req.user.id;
    }

    // Calculate total revenue (sum of all completed/delivered orders)
    const totalRevenueResult = await Order.aggregate([
      {
        $match: orderMatchQuery,
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Calculate monthly revenue
    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          ...orderMatchQuery,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Count total orders
    const totalOrders = await Order.countDocuments(orderQuery);

    // Count pending orders
    const pendingOrders = await Order.countDocuments({ ...orderQuery, orderStatus: 'pending' });

    // Count total products
    const totalProducts = await Product.countDocuments(productQuery);

    // Count low stock products (stock <= 10)
    const lowStockProducts = await Product.countDocuments({ ...productQuery, stock: { $lte: 10 } });

    // Count total customers (users with role 'user') - only for admin
    let totalCustomers = 0;
    if (req.user.role === 'admin') {
      totalCustomers = await User.countDocuments({ role: 'user' });
    }

    // Get recent orders (last 5)
    const recentOrders = await Order.find(orderQuery)
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customer total orderStatus createdAt');

    res.json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAnalytics, 
  getDashboardAnalytics,
  getSalesAnalytics,
  getProductAnalytics,
};
