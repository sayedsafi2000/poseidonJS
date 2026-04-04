const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Vendor Performance Schema
 */
const VendorPerformanceSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    metrics: {
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageDeliveryTime: { type: Number, default: 0 }, // in hours
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      returnRate: { type: Number, default: 0 }, // percentage
      cancelRate: { type: Number, default: 0 }, // percentage
      orderAccuracy: { type: Number, default: 100 }, // percentage
      totalProducts: { type: Number, default: 0 },
      activeProducts: { type: Number, default: 0 },
    },
    ranking: {
      overall: { type: Number, default: 0 },
      delivery: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
    },
    aiInsights: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VendorPerformanceSchema.index({ vendor: 1, period: 1, periodStart: -1 });
VendorPerformanceSchema.index({ 'ranking.overall': -1 });

module.exports = mongoose.model('VendorPerformance', VendorPerformanceSchema);

