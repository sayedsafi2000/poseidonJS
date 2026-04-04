const Order = require('../models/Order');
const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Generate auto reply for customer message
 * @route   POST /api/customer/auto-reply
 * @access  Private
 */
const generateAutoReply = async (req, res, next) => {
  try {
    const { message, orderId, productId, inquiryType } = req.body;
    const { role, id } = req.user;

    if (!message) {
      throw new ApiError(400, 'Customer message is required');
    }

    let order = null;
    let product = null;
    let context = '';

    // Get order context
    if (orderId) {
      order = await Order.findById(orderId)
        .populate('items.product', 'name')
        .populate('customer', 'firstName lastName');
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      if (role === 'vendor') {
        const vendorProducts = await Product.find({ vendor: id }).select('_id');
        const productIds = vendorProducts.map(p => p._id);
        const hasVendorProduct = order.items.some(item => 
          productIds.includes(item.product?._id?.toString())
        );
        if (!hasVendorProduct) {
          throw new ApiError(403, 'You can only reply to orders with your products');
        }
      }

      context += `Order #${order.orderNumber}\n`;
      context += `Status: ${order.orderStatus}\n`;
      context += `Payment: ${order.paymentStatus}\n`;
      if (order.trackingNumber) {
        context += `Tracking: ${order.trackingNumber}\n`;
      }
      context += `Items: ${order.items.map(i => i.name).join(', ')}\n`;
    }

    // Get product context
    if (productId) {
      product = await Product.findById(productId);
      if (product) {
        if (role === 'vendor' && product.vendor?.toString() !== id) {
          throw new ApiError(403, 'You can only reply about your own products');
        }
        context += `Product: ${product.name}\n`;
        context += `Stock: ${product.stock}\n`;
        context += `Price: $${product.price}\n`;
      }
    }

    // Determine inquiry type if not provided
    let detectedType = inquiryType || 'general';
    if (!inquiryType && isClaudeConfigured()) {
      try {
        const prompt = `Classify this customer inquiry: "${message}"

Types: delivery, stock, refund, product_details, shipping, general

Respond with ONLY the type.`;
        const out = await generateClaudeText(prompt, { maxTokens: 32 });
        if (out) detectedType = out.trim().toLowerCase();
      } catch (error) {
        console.error('Type detection error:', error);
      }
    }

    // Generate response
    let reply = '';
    if (isClaudeConfigured()) {
      try {
        const prompt = `You are a customer service representative. Generate a professional, helpful response to this customer inquiry:

Customer Message: "${message}"
Inquiry Type: ${detectedType}

${context ? `Context:\n${context}\n` : ''}

Requirements:
- Professional and friendly tone
- Address the customer's concern directly
- Provide specific information if available
- Include next steps if needed
- Keep it concise (2-3 sentences)
- If asking about delivery, provide estimated shipping info
- If asking about stock, provide current availability
- If asking about refund, explain refund policy briefly`;

        const text = await generateClaudeText(prompt, { maxTokens: 512 });
        if (text) reply = text.trim();
      } catch (error) {
        console.error('Auto-reply generation error:', error);
      }
    }

    // Fallback responses
    if (!reply) {
      switch (detectedType) {
        case 'delivery':
          reply = order && order.trackingNumber
            ? `Thank you for your inquiry. Your order #${order.orderNumber} is currently ${order.orderStatus}. Tracking number: ${order.trackingNumber}. Expected delivery: 3-5 business days.`
            : `Thank you for your inquiry. Your order is being processed and will be shipped within 1-2 business days. You'll receive a tracking number via email once shipped.`;
          break;
        case 'stock':
          reply = product
            ? `Thank you for your interest! ${product.name} is currently ${product.stock > 0 ? `in stock (${product.stock} available)` : 'out of stock'}. ${product.stock > 0 ? 'We can ship it immediately.' : 'We expect restocking soon. Please check back or contact us for updates.'}`
            : `Thank you for your inquiry. Please check the product page for current stock availability, or contact us for more information.`;
          break;
        case 'refund':
          reply = `Thank you for contacting us. Our refund policy allows returns within 30 days of delivery for unused items in original packaging. Please contact our support team with your order number for assistance with your refund request.`;
          break;
        case 'product_details':
          reply = product
            ? `Thank you for your inquiry about ${product.name}. ${product.description?.substring(0, 100)}... For more details, please visit the product page or contact us.`
            : `Thank you for your inquiry. Please visit the product page for detailed information, or contact us if you need specific details.`;
          break;
        default:
          reply = `Thank you for contacting us. We've received your message and will get back to you shortly. If this is urgent, please call our support line.`;
      }
    }

    res.json({
      success: true,
      data: {
        reply,
        inquiryType: detectedType,
        context: {
          orderId: order?._id || null,
          productId: product?._id || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAutoReply,
};

