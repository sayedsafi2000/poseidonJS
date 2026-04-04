const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Notification Schema
 */
const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error', 'ai_recommendation'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['low_stock', 'new_order', 'product_added', 'daily_summary', 'ai_smart', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means notification for all admins
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      default: null, // Can reference product, order, etc.
    },
    relatedType: {
      type: String,
      enum: ['product', 'order', 'user', null],
      default: null,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

