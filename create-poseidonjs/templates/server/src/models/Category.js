const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Category Schema
 */
const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // NEW: Reference to parent Collection
    collection: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for optimization
CategorySchema.index({ parent: 1, isActive: 1 });
CategorySchema.index({ collection: 1, isActive: 1 });

module.exports = mongoose.model('Category', CategorySchema);

