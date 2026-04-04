const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Promotion Schema
 */
const PromotionSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Promotion code is required'],
      unique: true,
      index: true, // Combined with unique
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: [true, 'Promotion type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Promotion value is required'],
      min: [0, 'Value cannot be negative'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    minPurchase: {
      type: Number,
      min: [0, 'Minimum purchase cannot be negative'],
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for optimization
// code index removed (already defined with unique: true in schema)
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', PromotionSchema);

