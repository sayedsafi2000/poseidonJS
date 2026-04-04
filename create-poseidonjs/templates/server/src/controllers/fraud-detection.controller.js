const Order = require('../models/Order');
const User = require('../models/User');
const FraudDetection = require('../models/FraudDetection');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Check for fraud patterns
 * @route   GET /api/ai/fraud-check
 * @access  Private (Admin only)
 */
const checkFraud = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Only admins can perform fraud checks');
    }

    const { type = 'all', limit = 50 } = req.query;

    const fraudCases = [];
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Check order patterns
    if (type === 'all' || type === 'order') {
      // Multiple cancellations from same customer
      const cancellationGroups = await Order.aggregate([
        {
          $match: {
            orderStatus: 'cancelled',
            createdAt: { $gte: last30Days },
          },
        },
        {
          $group: {
            _id: '$customer',
            count: { $sum: 1 },
            orders: { $push: '$$ROOT' },
          },
        },
        {
          $match: { count: { $gte: 3 } },
        },
      ]);

      for (const group of cancellationGroups) {
        const riskLevel = group.count >= 5 ? 'high' : group.count >= 3 ? 'medium' : 'low';
        fraudCases.push({
          type: 'order',
          relatedId: group._id,
          relatedType: 'User',
          riskLevel,
          indicators: [`${group.count} cancelled orders in last 30 days`],
          patterns: ['Multiple cancellations'],
        });
      }

      // Sudden refund spikes
      const refundGroups = await Order.aggregate([
        {
          $match: {
            paymentStatus: 'refunded',
            createdAt: { $gte: last30Days },
          },
        },
        {
          $group: {
            _id: '$customer',
            count: { $sum: 1 },
            totalRefund: { $sum: '$total' },
          },
        },
        {
          $match: { count: { $gte: 2 }, totalRefund: { $gte: 500 } },
        },
      ]);

      for (const group of refundGroups) {
        fraudCases.push({
          type: 'order',
          relatedId: group._id,
          relatedType: 'User',
          riskLevel: group.totalRefund >= 1000 ? 'high' : 'medium',
          indicators: [`${group.count} refunds totaling $${group.totalRefund}`],
          patterns: ['High refund volume'],
        });
      }

      // Unusual order patterns (same address, multiple cards)
      const addressGroups = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: last30Days },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: {
              address: '$shippingAddress.address',
              city: '$shippingAddress.city',
            },
            customers: { $addToSet: '$customer' },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            $expr: { $gt: [{ $size: '$customers' }, 3] },
          },
        },
      ]);

      for (const group of addressGroups) {
        if (group.count > 5) {
          fraudCases.push({
            type: 'order',
            relatedId: group.customers[0],
            relatedType: 'User',
            riskLevel: 'medium',
            indicators: [`${group.count} orders from same address with ${group.customers.length} different customers`],
            patterns: ['Shared address pattern'],
          });
        }
      }
    }

    // Check vendor behavior
    if (type === 'all' || type === 'vendor') {
      const vendors = await User.find({ role: 'vendor', isActive: true });
      
      for (const vendor of vendors) {
        const vendorOrders = await Order.find({
          'items.product': { $in: await require('../models/Product').find({ vendor: vendor._id }).distinct('_id') },
          createdAt: { $gte: last30Days },
        });

        const cancelRate = vendorOrders.filter(o => o.orderStatus === 'cancelled').length / (vendorOrders.length || 1);
        const refundRate = vendorOrders.filter(o => o.paymentStatus === 'refunded').length / (vendorOrders.length || 1);

        if (cancelRate > 0.3 || refundRate > 0.2) {
          fraudCases.push({
            type: 'vendor',
            relatedId: vendor._id,
            relatedType: 'User',
            riskLevel: cancelRate > 0.5 || refundRate > 0.3 ? 'high' : 'medium',
            indicators: [
              `Cancel rate: ${(cancelRate * 100).toFixed(1)}%`,
              `Refund rate: ${(refundRate * 100).toFixed(1)}%`,
            ],
            patterns: ['High cancellation/refund rate'],
          });
        }
      }
    }

    // Generate AI analysis for each case
    const analyzedCases = [];
    for (const fraudCase of fraudCases.slice(0, limit)) {
      let aiAnalysis = '';

      if (isClaudeConfigured()) {
        try {
          const prompt = `Analyze this potential fraud case:
Type: ${fraudCase.type}
Risk Level: ${fraudCase.riskLevel}
Indicators: ${fraudCase.indicators.join(', ')}
Patterns: ${fraudCase.patterns.join(', ')}

Provide a brief analysis and recommendation.`;

          const text = await generateClaudeText(prompt, { maxTokens: 512 });
          if (text) aiAnalysis = text;
        } catch (error) {
          console.error('AI fraud analysis error:', error);
        }
      }

      // Save or update fraud detection record
      const existing = await FraudDetection.findOne({
        relatedId: fraudCase.relatedId,
        relatedType: fraudCase.relatedType,
        type: fraudCase.type,
        actionTaken: { $ne: 'resolved' },
      });

      if (existing) {
        existing.riskLevel = fraudCase.riskLevel;
        existing.indicators = fraudCase.indicators;
        existing.patterns = fraudCase.patterns;
        existing.aiAnalysis = aiAnalysis || existing.aiAnalysis;
        await existing.save();
        analyzedCases.push(existing);
      } else {
        const newCase = await FraudDetection.create({
          ...fraudCase,
          aiAnalysis: aiAnalysis || `Risk level: ${fraudCase.riskLevel}. Requires investigation.`,
        });
        analyzedCases.push(newCase);
      }
    }

    res.json({
      success: true,
      data: {
        totalCases: analyzedCases.length,
        cases: analyzedCases,
        summary: {
          critical: analyzedCases.filter(c => c.riskLevel === 'critical').length,
          high: analyzedCases.filter(c => c.riskLevel === 'high').length,
          medium: analyzedCases.filter(c => c.riskLevel === 'medium').length,
          low: analyzedCases.filter(c => c.riskLevel === 'low').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor fraud check
 * @route   GET /api/vendor/:id/fraud-check
 * @access  Private (Admin only)
 */
const getVendorFraudCheck = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Only admins can check vendor fraud');
    }

    const { id } = req.params;
    const fraudCases = await FraudDetection.find({
      type: 'vendor',
      relatedId: id,
      relatedType: 'User',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: fraudCases,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkFraud,
  getVendorFraudCheck,
};

