const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Banner Schema
 */
const BannerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    mobileImage: {
      type: String,
    },
    link: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
      maxlength: [50, 'Link text cannot exceed 50 characters'],
    },
    position: {
      type: String,
      enum: ['hero', 'promotional', 'category', 'sidebar'],
      required: [true, 'Banner position is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for optimization
BannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', BannerSchema);

