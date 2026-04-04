const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Order Schema
 */
const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // Combined with unique
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'hold'],
      default: 'pending',
    },
    invoiceStatus: {
      type: String,
      enum: ['pending', 'hold', 'complete', 'shipment', 'cancelled'],
      default: 'pending',
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: String,
    trackingNumber: String,
    paidAt: Date,
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${timestamp}${random}`;
}

// Must run before validation — required `orderNumber` is validated before pre('save')
OrderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

// Fallback if document bypasses validate (e.g. some bulk ops)
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

// Create notification after order is created
OrderSchema.post('save', async function (doc) {
  try {
    // Only create notification for new orders (not updates)
    if (doc.isNew || this.wasNew) {
      const notificationService = require('../services/notification.service');
      await notificationService.createNewOrderNotification(doc);
    }
  } catch (error) {
    console.error('Error creating order notification:', error);
    // Don't throw error to prevent order creation failure
  }
});

// Index for optimization
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
// orderNumber index removed (already defined with unique: true in schema)

module.exports = mongoose.model('Order', OrderSchema);

