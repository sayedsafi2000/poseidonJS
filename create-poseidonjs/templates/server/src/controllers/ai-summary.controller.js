const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const VendorPerformance = require('../models/VendorPerformance');
const AIInsight = require('../models/AIInsight');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Get date range for period
 */
const getDateRange = (period) => {
  const now = new Date();
  let start, end = now;

  switch (period) {
    case 'daily':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
};

/**
 * Generate AI summary using Claude
 */
const generateAISummary = async (data, period) => {
  if (!isClaudeConfigured()) {
    return generateFallbackSummary(data, period);
  }

  const prompt = `You are a business intelligence AI assistant. Generate a comprehensive ${period} business summary based on the following data:

${JSON.stringify(data, null, 2)}

Provide a well-structured summary covering:
1. Key highlights
2. Performance metrics
3. Top performers
4. Areas of concern
5. Actionable recommendations

Format the response in a clear, professional manner.`;

  const text = await generateClaudeText(prompt, { maxTokens: 4096 });
  if (text) return text;
  return generateFallbackSummary(data, period);
};

/**
 * Fallback summary without AI
 */
const generateFallbackSummary = (data, period) => {
  return `
${period.toUpperCase()} BUSINESS SUMMARY

📊 PERFORMANCE OVERVIEW
- Total Orders: ${data.totalOrders}
- Total Revenue: $${data.totalRevenue.toFixed(2)}
- New Customers: ${data.newCustomers}

🏆 TOP PRODUCTS
${data.bestSellingProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - ${p.sold} sold`).join('\n')}

⚠️ LOW STOCK ALERTS
${data.lowStockProducts.length > 0 ? data.lowStockProducts.slice(0, 5).map(p => `- ${p.name} (${p.stock} left)`).join('\n') : 'No low stock items'}

💡 RECOMMENDATIONS
${data.recommendations.join('\n')}
  `.trim();
};

/**
 * Get business summary
 * @route   GET /api/ai-summary/:period
 * @access  Private
 */
const getBusinessSummary = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.params;
    const { userId, role } = req.user;

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      throw new ApiError(400, 'Invalid period. Use: daily, weekly, or monthly');
    }

    const { start, end } = getDateRange(period);

    // Build query based on role
    const orderQuery = {
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'paid',
    };

    if (role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: userId }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      orderQuery['items.product'] = { $in: productIds };
    }

    // Get orders
    const orders = await Order.find(orderQuery)
      .populate('items.product', 'name vendor')
      .populate('customer', 'firstName lastName email');

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Get product sales
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: item.product?.name || item.name,
              sold: 0,
              revenue: 0,
            };
          }
          productSales[productId].sold += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const bestSellingProducts = Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    const slowSellingProducts = Object.values(productSales)
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 10);

    // Get low stock products
    const productQuery = { isActive: true };
    if (role === 'vendor') {
      productQuery.vendor = userId;
    }
    const lowStockProducts = await Product.find({
      ...productQuery,
      stock: { $lte: 5 },
    })
      .select('name stock sku')
      .limit(10);

    // Get new customers
    const customerQuery = { createdAt: { $gte: start, $lte: end } };
    if (role === 'vendor') {
      // For vendors, get customers who ordered their products
      const vendorProducts = await Product.find({ vendor: userId }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      const vendorOrders = await Order.find({
        'items.product': { $in: productIds },
        createdAt: { $gte: start, $lte: end },
      }).select('customer');
      const customerIds = [...new Set(vendorOrders.map(o => o.customer?.toString()).filter(Boolean))];
      customerQuery._id = { $in: customerIds };
    }
    const newCustomers = await User.countDocuments(customerQuery);

    // Get vendor performance (admin only)
    let vendorPerformance = [];
    if (role === 'admin') {
      const vendors = await User.find({ role: 'vendor', isActive: true }).select('_id firstName lastName');
      vendorPerformance = await Promise.all(
        vendors.map(async (vendor) => {
          const vendorProducts = await Product.find({ vendor: vendor._id }).select('_id');
          const productIds = vendorProducts.map(p => p._id);
          const vendorOrders = await Order.find({
            'items.product': { $in: productIds },
            createdAt: { $gte: start, $lte: end },
          });
          const vendorRevenue = vendorOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          return {
            vendorId: vendor._id,
            vendorName: `${vendor.firstName} ${vendor.lastName}`,
            orders: vendorOrders.length,
            revenue: vendorRevenue,
          };
        })
      );
      vendorPerformance.sort((a, b) => b.revenue - a.revenue);
    }

    // Generate recommendations
    const recommendations = [];
    if (lowStockProducts.length > 0) {
      recommendations.push(`⚠️ ${lowStockProducts.length} products are low on stock. Consider restocking.`);
    }
    if (slowSellingProducts.length > 0 && slowSellingProducts[0].sold === 0) {
      recommendations.push(`📦 Some products have no sales. Consider promotions or price adjustments.`);
    }
    if (totalOrders > 0 && totalRevenue > 0) {
      const avgOrderValue = totalRevenue / totalOrders;
      if (avgOrderValue < 50) {
        recommendations.push(`💡 Average order value is low. Consider upselling strategies.`);
      }
    }

    const summaryData = {
      period,
      dateRange: { start, end },
      totalOrders,
      totalRevenue,
      newCustomers,
      bestSellingProducts: bestSellingProducts.slice(0, 10),
      slowSellingProducts: slowSellingProducts.slice(0, 10),
      lowStockProducts,
      vendorPerformance: vendorPerformance.slice(0, 10),
      recommendations,
    };

    // Generate AI summary
    const aiSummary = await generateAISummary(summaryData, period);

    // Save insight
    await AIInsight.create({
      type: 'business_summary',
      title: `${period.toUpperCase()} Business Summary`,
      insight: aiSummary,
      priority: 'medium',
      metadata: summaryData,
    });

    res.json({
      success: true,
      data: {
        ...summaryData,
        aiSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinessSummary,
};

