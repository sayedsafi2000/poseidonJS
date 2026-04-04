const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const VendorPerformance = require('../models/VendorPerformance');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Get vendor improvement suggestions
 * @route   GET /api/vendor/:id/improvement-tips
 * @access  Private
 */
const getImprovementTips = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    if (role === 'vendor' && id !== userId) {
      throw new ApiError(403, 'You can only view your own improvement tips');
    }

    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== 'vendor') {
      throw new ApiError(404, 'Vendor not found');
    }

    // Get vendor data
    const products = await Product.find({ vendor: id });
    const vendorProducts = products.map(p => p._id);
    
    const orders = await Order.find({
      'items.product': { $in: vendorProducts },
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const reviews = await Review.find({ vendor: id });

    // Analyze data
    const analysis = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      totalReviews: reviews.length,
      lowStockProducts: products.filter(p => p.stock <= 5).length,
      productsWithoutDescription: products.filter(p => !p.description || p.description.length < 50).length,
      productsWithoutImages: products.filter(p => !p.images || p.images.length === 0).length,
    };

    // Calculate metrics
    const cancelRate = analysis.totalOrders > 0
      ? (analysis.cancelledOrders / analysis.totalOrders) * 100
      : 0;

    const completionRate = analysis.totalOrders > 0
      ? (analysis.completedOrders / analysis.totalOrders) * 100
      : 0;

    // Generate improvement suggestions
    const suggestions = [];

    // Packaging suggestions
    if (cancelRate > 10) {
      suggestions.push({
        category: 'packaging',
        priority: 'high',
        issue: 'High cancellation rate',
        suggestion: 'Improve product packaging quality and accuracy. Ensure products match descriptions exactly.',
        metric: `Cancel rate: ${cancelRate.toFixed(1)}%`,
      });
    }

    // Delivery time
    const deliveredOrders = orders.filter(o => o.deliveredAt && o.orderStatus === 'delivered');
    if (deliveredOrders.length > 0) {
      const avgDeliveryHours = deliveredOrders.reduce((sum, o) => {
        return sum + (o.deliveredAt - o.createdAt) / (1000 * 60 * 60);
      }, 0) / deliveredOrders.length;

      if (avgDeliveryHours > 72) {
        suggestions.push({
          category: 'delivery',
          priority: 'high',
          issue: 'Slow delivery time',
          suggestion: 'Reduce processing and shipping time. Consider faster shipping options or optimize fulfillment process.',
          metric: `Average delivery: ${(avgDeliveryHours / 24).toFixed(1)} days`,
        });
      }
    }

    // Product descriptions
    if (analysis.productsWithoutDescription > 0) {
      suggestions.push({
        category: 'description',
        priority: 'medium',
        issue: 'Incomplete product descriptions',
        suggestion: `Add detailed descriptions to ${analysis.productsWithoutDescription} products. Better descriptions improve sales and reduce returns.`,
        metric: `${analysis.productsWithoutDescription} products need descriptions`,
      });
    }

    // Product images
    if (analysis.productsWithoutImages > 0) {
      suggestions.push({
        category: 'images',
        priority: 'high',
        issue: 'Products missing images',
        suggestion: `Add high-quality images to ${analysis.productsWithoutImages} products. Images are crucial for online sales.`,
        metric: `${analysis.productsWithoutImages} products need images`,
      });
    }

    // Pricing
    const lowPricedProducts = products.filter(p => (p.salePrice || p.price) < 10).length;
    if (lowPricedProducts > products.length * 0.3) {
      suggestions.push({
        category: 'pricing',
        priority: 'medium',
        issue: 'Many products priced very low',
        suggestion: 'Review pricing strategy. Very low prices may indicate quality concerns or missed revenue opportunities.',
        metric: `${lowPricedProducts} products priced under $10`,
      });
    }

    // Stock management
    if (analysis.lowStockProducts > 0) {
      suggestions.push({
        category: 'inventory',
        priority: 'medium',
        issue: 'Low stock products',
        suggestion: `Restock ${analysis.lowStockProducts} products to avoid out-of-stock situations and lost sales.`,
        metric: `${analysis.lowStockProducts} products low on stock`,
      });
    }

    // Review quality
    if (analysis.averageRating < 3.5 && analysis.totalReviews > 5) {
      suggestions.push({
        category: 'quality',
        priority: 'high',
        issue: 'Low average rating',
        suggestion: 'Focus on improving product quality and customer service. Address common complaints from reviews.',
        metric: `Average rating: ${analysis.averageRating.toFixed(1)}/5`,
      });
    }

    // Generate AI summary
    let aiSummary = '';
    if (isClaudeConfigured() && suggestions.length > 0) {
      try {
        const prompt = `Analyze this vendor's performance and provide improvement recommendations:

Total Products: ${analysis.totalProducts}
Active Products: ${analysis.activeProducts}
Total Orders: ${analysis.totalOrders}
Completion Rate: ${completionRate.toFixed(1)}%
Cancel Rate: ${cancelRate.toFixed(1)}%
Average Rating: ${analysis.averageRating.toFixed(1)}/5
Total Reviews: ${analysis.totalReviews}

Key Issues:
${suggestions.map(s => `- ${s.issue}: ${s.suggestion}`).join('\n')}

Provide a comprehensive improvement plan with prioritized actions.`;

        const text = await generateClaudeText(prompt, { maxTokens: 2048 });
        if (text) aiSummary = text.trim();
      } catch (error) {
        console.error('AI improvement analysis error:', error);
      }
    }

    if (!aiSummary) {
      aiSummary = `Improvement Plan for ${vendor.firstName} ${vendor.lastName}:

Priority Actions:
${suggestions.filter(s => s.priority === 'high').map(s => `1. ${s.suggestion}`).join('\n')}

Medium Priority:
${suggestions.filter(s => s.priority === 'medium').map(s => `- ${s.suggestion}`).join('\n')}

Focus on improving ${suggestions[0]?.category || 'overall performance'} to see the most impact.`;
    }

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: `${vendor.firstName} ${vendor.lastName}`,
          email: vendor.email,
        },
        metrics: analysis,
        suggestions,
        aiSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getImprovementTips,
};

