const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Get customer behavior insights
 * @route   GET /api/ai/customer-insights
 * @access  Private
 */
const getCustomerInsights = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { role, id } = req.user;

    // Get date range
    const now = new Date();
    let start = new Date(now);
    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }
    start.setHours(0, 0, 0, 0);

    // Build order query
    const orderQuery = {
      createdAt: { $gte: start, $lte: now },
      paymentStatus: 'paid',
    };

    if (role === 'vendor') {
      const vendorProducts = await Product.find({ vendor: id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      orderQuery['items.product'] = { $in: productIds };
    }

    const orders = await Order.find(orderQuery)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name categories');

    // Analyze customer patterns
    const customerOrders = {};
    const categoryPurchases = {};
    const productPurchases = {};
    const repeatCustomers = new Set();
    const abandonedProducts = new Set();

    orders.forEach(order => {
      const customerId = order.customer?._id?.toString();
      if (customerId) {
        if (!customerOrders[customerId]) {
          customerOrders[customerId] = {
            customer: order.customer,
            orders: [],
            totalSpent: 0,
            orderCount: 0,
          };
        }
        customerOrders[customerId].orders.push(order);
        customerOrders[customerId].totalSpent += order.total || 0;
        customerOrders[customerId].orderCount++;

        if (customerOrders[customerId].orderCount > 1) {
          repeatCustomers.add(customerId);
        }
      }

      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (productId) {
          productPurchases[productId] = (productPurchases[productId] || 0) + item.quantity;
        }

        if (item.product?.categories) {
          item.product.categories.forEach(cat => {
            const catId = cat._id?.toString() || cat.toString();
            categoryPurchases[catId] = (categoryPurchases[catId] || 0) + item.quantity;
          });
        }
      });
    });

    // Find top customers
    const topCustomers = Object.values(customerOrders)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        customer: {
          id: c.customer._id,
          name: `${c.customer.firstName} ${c.customer.lastName}`,
          email: c.customer.email,
        },
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
      }));

    // Find trending categories
    const trendingCategories = Object.entries(categoryPurchases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Find high abandonment products (products with views but no purchases)
    // This would require tracking product views, for now we'll identify low-selling products
    const allProducts = await Product.find({ isActive: true }).select('name soldCount categories');
    const lowSellingProducts = allProducts
      .filter(p => (p.soldCount || 0) === 0)
      .slice(0, 10)
      .map(p => ({
        id: p._id,
        name: p.name,
        soldCount: 0,
        categories: p.categories,
      }));

    // Calculate repeat purchase rate
    const totalCustomers = Object.keys(customerOrders).length;
    const repeatPurchaseRate = totalCustomers > 0
      ? (repeatCustomers.size / totalCustomers) * 100
      : 0;

    // Average order value
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Generate AI insights
    let aiInsights = '';
    const insightsData = {
      totalCustomers,
      repeatCustomers: repeatCustomers.size,
      repeatPurchaseRate: repeatPurchaseRate.toFixed(1),
      averageOrderValue: averageOrderValue.toFixed(2),
      totalOrders: orders.length,
      trendingCategories: trendingCategories.length,
      lowSellingProducts: lowSellingProducts.length,
    };

    if (isClaudeConfigured()) {
      try {
        const prompt = `Analyze customer behavior patterns and provide insights:

Total Customers: ${totalCustomers}
Repeat Customers: ${repeatCustomers.size}
Repeat Purchase Rate: ${repeatPurchaseRate.toFixed(1)}%
Average Order Value: $${averageOrderValue.toFixed(2)}
Total Orders: ${orders.length}
Trending Categories: ${trendingCategories.length}
Low Selling Products: ${lowSellingProducts.length}

Provide insights on:
1. Customer buying patterns
2. Repeat buyer behavior
3. Trending categories
4. Products that need attention
5. Recommendations for improvement`;

        const text = await generateClaudeText(prompt, { maxTokens: 2048 });
        if (text) aiInsights = text.trim();
      } catch (error) {
        console.error('AI insights generation error:', error);
      }
    }

    if (!aiInsights) {
      aiInsights = `Customer Behavior Insights (${period}):

📊 Key Metrics:
- Total Customers: ${totalCustomers}
- Repeat Customers: ${repeatCustomers.size} (${repeatPurchaseRate.toFixed(1)}% repeat rate)
- Average Order Value: $${averageOrderValue.toFixed(2)}
- Total Orders: ${orders.length}

🔄 Repeat Buyer Analysis:
${repeatPurchaseRate > 20 ? '✅ Good repeat purchase rate. Focus on retention strategies.' : '⚠️ Low repeat purchase rate. Implement loyalty programs.'}

📈 Trending Categories:
${trendingCategories.length > 0 ? `Top categories are performing well.` : 'No clear category trends.'}

⚠️ Products Needing Attention:
${lowSellingProducts.length} products have no sales. Consider promotions or removal.`;
    }

    res.json({
      success: true,
      data: {
        period,
        metrics: insightsData,
        topCustomers,
        trendingCategories: trendingCategories.slice(0, 10).map(([catId, count]) => ({
          categoryId: catId,
          purchaseCount: count,
        })),
        lowSellingProducts,
        aiInsights,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerInsights,
};

