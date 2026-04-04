const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Fraud Detection Schema
 */
const FraudDetectionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['order', 'vendor', 'customer', 'payment'],
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    relatedType: {
      type: String,
      enum: ['Order', 'User', 'Product'],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    indicators: [String],
    patterns: [String],
    aiAnalysis: String,
    actionTaken: {
      type: String,
      enum: ['none', 'flagged', 'suspended', 'investigating', 'resolved'],
      default: 'none',
    },
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

FraudDetectionSchema.index({ type: 1, riskLevel: 1, createdAt: -1 });
FraudDetectionSchema.index({ relatedId: 1, relatedType: 1 });

module.exports = mongoose.model('FraudDetection', FraudDetectionSchema);

