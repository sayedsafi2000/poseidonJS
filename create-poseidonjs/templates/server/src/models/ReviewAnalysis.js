const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Review Analysis Schema
 */
const ReviewAnalysisSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    analysisType: {
      type: String,
      enum: ['product', 'vendor', 'overall'],
      required: true,
    },
    sentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      overall: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    },
    commonProblems: [
      {
        issue: String,
        frequency: Number,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
      },
    ],
    improvements: [String],
    serviceQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiSummary: String,
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ReviewAnalysisSchema.index({ product: 1, analyzedAt: -1 });
ReviewAnalysisSchema.index({ vendor: 1, analyzedAt: -1 });

module.exports = mongoose.model('ReviewAnalysis', ReviewAnalysisSchema);

