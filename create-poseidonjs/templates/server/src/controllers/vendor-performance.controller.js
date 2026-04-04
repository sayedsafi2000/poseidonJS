const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VendorPerformance = require('../models/VendorPerformance');
const Review = require('../models/Review');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Calculate vendor performance metrics
 */
const calculateVendorMetrics = async (vendorId, period = 'monthly') => {
  const now = new Date();
  let start, end = now;

  switch (period) {
    case 'daily':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
  }
  start.setHours(0, 0, 0, 0);

  const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
  const productIds = vendorProducts.map(p => p._id);

  const orders = await Order.find({
    'items.product': { $in: productIds },
    createdAt: { $gte: start, $lte: end },
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Calculate average delivery time (simplified)
  const deliveredOrders = orders.filter(o => o.deliveredAt && o.orderStatus === 'delivered');
  let averageDeliveryTime = 0;
  if (deliveredOrders.length > 0) {
    const totalHours = deliveredOrders.reduce((sum, o) => {
      const hours = (o.deliveredAt - o.createdAt) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    averageDeliveryTime = totalHours / deliveredOrders.length;
  }

  // Get reviews
  const reviews = await Review.find({ vendor: vendorId });
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Calculate return and cancel rates
  const returnRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // Calculate order accuracy (simplified - based on cancellations)
  const orderAccuracy = totalOrders > 0
    ? ((totalOrders - cancelledOrders) / totalOrders) * 100
    : 100;

  return {
    totalOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    averageDeliveryTime,
    averageRating,
    totalReviews: reviews.length,
    returnRate,
    cancelRate,
    orderAccuracy,
    totalProducts: vendorProducts.length,
    activeProducts: vendorProducts.filter(p => p.isActive).length,
  };
};

/**
 * Calculate ranking scores
 */
const calculateRanking = (metrics) => {
  // Delivery score (0-25 points)
  const deliveryScore = Math.min(25, (48 - metrics.averageDeliveryTime) / 48 * 25);

  // Quality score (0-25 points) - based on rating
  const qualityScore = (metrics.averageRating / 5) * 25;

  // Service score (0-25 points) - based on order accuracy and cancel rate
  const serviceScore = (metrics.orderAccuracy / 100) * 15 + (1 - metrics.cancelRate / 100) * 10;

  // Sales score (0-25 points) - based on revenue and orders
  const salesScore = Math.min(25, (metrics.totalOrders / 100) * 15 + (metrics.totalRevenue / 10000) * 10);

  const overall = deliveryScore + qualityScore + serviceScore + salesScore;

  return {
    overall: Math.round(overall),
    delivery: Math.round(deliveryScore),
    quality: Math.round(qualityScore),
    service: Math.round(serviceScore),
  };
};

/**
 * Get vendor performance ranking
 * @route   GET /api/vendors/performance
 * @access  Private
 */
const getVendorPerformance = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { role, id } = req.user;

    let vendors;
    if (role === 'vendor') {
      vendors = [await User.findById(id)];
    } else {
      vendors = await User.find({ role: 'vendor', isActive: true });
    }

    const performances = await Promise.all(
      vendors.map(async (vendor) => {
        const metrics = await calculateVendorMetrics(vendor._id, period);
        const ranking = calculateRanking(metrics);

        // Save performance record
        const { start, end } = getDateRange(period);
        await VendorPerformance.findOneAndUpdate(
          {
            vendor: vendor._id,
            period,
            periodStart: start,
          },
          {
            vendor: vendor._id,
            period,
            periodStart: start,
            periodEnd: end,
            metrics,
            ranking,
          },
          { upsert: true, new: true }
        );

        return {
          vendor: {
            id: vendor._id,
            name: `${vendor.firstName} ${vendor.lastName}`,
            email: vendor.email,
          },
          metrics,
          ranking,
        };
      })
    );

    // Sort by overall ranking
    performances.sort((a, b) => b.ranking.overall - a.ranking.overall);

    res.json({
      success: true,
      data: {
        period,
        performances,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor ranking
 * @route   GET /api/vendors/ranking
 * @access  Private
 */
const getVendorRanking = async (req, res, next) => {
  try {
    const { period = 'monthly', limit = 10 } = req.query;

    const performances = await VendorPerformance.find({ period })
      .populate('vendor', 'firstName lastName email')
      .sort({ 'ranking.overall': -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        period,
        rankings: performances.map((p, index) => ({
          rank: index + 1,
          vendor: {
            id: p.vendor._id,
            name: `${p.vendor.firstName} ${p.vendor.lastName}`,
            email: p.vendor.email,
          },
          metrics: p.metrics,
          ranking: p.ranking,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get date range
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
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
};

module.exports = {
  getVendorPerformance,
  getVendorRanking,
};

