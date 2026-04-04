const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AI Insights Log Schema
 */
const AIInsightSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'business_summary',
        'inventory_cleanup',
        'customer_insights',
        'vendor_improvement',
        'fraud_alert',
        'pricing_suggestion',
        'review_analysis',
        'general',
      ],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    targetType: {
      type: String,
      enum: ['product', 'vendor', 'order', 'customer', null],
      default: null,
    },
    title: String,
    insight: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    actionable: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: Date,
  },
  {
    timestamps: true,
  }
);

AIInsightSchema.index({ type: 1, createdAt: -1 });
AIInsightSchema.index({ targetId: 1, targetType: 1 });
AIInsightSchema.index({ priority: 1, viewed: 1, createdAt: -1 });

module.exports = mongoose.model('AIInsight', AIInsightSchema);

