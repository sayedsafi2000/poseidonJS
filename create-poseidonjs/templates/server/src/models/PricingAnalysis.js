const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Pricing Analysis Schema
 */
const PricingAnalysisSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    competitorPrices: [
      {
        vendor: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        price: Number,
        productName: String,
      },
    ],
    averageMarketPrice: Number,
    recommendedPrice: Number,
    priceStatus: {
      type: String,
      enum: ['overpriced', 'underpriced', 'competitive', 'optimal'],
    },
    aiRecommendation: String,
    suggestedDiscount: Number, // percentage
    suggestedIncrease: Number, // percentage
  },
  {
    timestamps: true,
  }
);

PricingAnalysisSchema.index({ product: 1, createdAt: -1 });
PricingAnalysisSchema.index({ priceStatus: 1 });

module.exports = mongoose.model('PricingAnalysis', PricingAnalysisSchema);

