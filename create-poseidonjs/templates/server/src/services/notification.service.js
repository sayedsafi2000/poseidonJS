const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Create low stock notification
 */
const createLowStockNotification = async (product) => {
  try {
    if (product.stock < 5) {
      await Notification.create({
        title: '⚠️ Low Stock Alert',
        message: `Low Stock: ${product.name} (Stock: ${product.stock})`,
        type: 'warning',
        category: 'low_stock',
        relatedId: product._id,
        relatedType: 'product',
        metadata: {
          stock: product.stock,
          sku: product.sku,
        },
      });
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
};

/**
 * Create new order notification
 */
const createNewOrderNotification = async (order) => {
  try {
    const itemCount = order.items ? order.items.length : 0;
    await Notification.create({
      title: '🛒 New Order',
      message: `New Order #${order.orderNumber} for ${itemCount} item${itemCount > 1 ? 's' : ''} placed`,
      type: 'success',
      category: 'new_order',
      relatedId: order._id,
      relatedType: 'order',
      metadata: {
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Error creating new order notification:', error);
  }
};

/**
 * Create product added notification
 */
const createProductAddedNotification = async (product, addedBy = 'admin') => {
  try {
    await Notification.create({
      title: '📦 New Product Added',
      message: `New Product: ${product.name} has been added${addedBy === 'ai' ? ' via AI assistant' : ''}`,
      type: 'success',
      category: 'product_added',
      relatedId: product._id,
      relatedType: 'product',
      metadata: {
        addedBy,
        sku: product.sku,
      },
    });
  } catch (error) {
    console.error('Error creating product added notification:', error);
  }
};

/**
 * Create daily summary notification
 */
const createDailySummaryNotification = async (userId = null) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      paymentStatus: 'paid',
    });

    const totalSales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const orderCount = todayOrders.length;

    // Get low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
      isActive: true,
    }).limit(5);

    // Build summary message
    let summaryMessage = `📊 Daily Summary:\n`;
    summaryMessage += `• Total Sales: $${totalSales.toFixed(2)}\n`;
    summaryMessage += `• New Orders: ${orderCount}\n`;
    summaryMessage += `• Low Stock Items: ${lowStockProducts.length}`;

    if (lowStockProducts.length > 0) {
      summaryMessage += `\n\n⚠️ Low Stock Products:\n`;
      lowStockProducts.slice(0, 3).forEach((product) => {
        summaryMessage += `• ${product.name} (${product.stock} left)\n`;
      });
    }

    await Notification.create({
      title: '📊 Daily Summary',
      message: summaryMessage,
      type: 'info',
      category: 'daily_summary',
      userId,
      metadata: {
        totalSales,
        orderCount,
        lowStockCount: lowStockProducts.length,
        date: today.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating daily summary notification:', error);
  }
};

/**
 * Create AI-generated smart notification
 */
const createAISmartNotification = async (product) => {
  try {
    // This would use AI to generate smart recommendations
    // For now, create a simple recommendation based on stock
    if (product.stock <= 2 && product.soldCount > 0) {
      await Notification.create({
        title: '💡 AI Recommendation',
        message: `💡 Recommendation: ${product.name} is trending. Stock only ${product.stock} left. Consider restocking soon.`,
        type: 'info',
        category: 'ai_smart',
        relatedId: product._id,
        relatedType: 'product',
        metadata: {
          stock: product.stock,
          soldCount: product.soldCount,
        },
      });
    }
  } catch (error) {
    console.error('Error creating AI smart notification:', error);
  }
};

/**
 * Check and create low stock notifications for all products
 */
const checkLowStockProducts = async () => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
      isActive: true,
    });

    for (const product of lowStockProducts) {
      // Check if notification already exists for this product today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingNotification = await Notification.findOne({
        relatedId: product._id,
        category: 'low_stock',
        createdAt: { $gte: today },
      });

      if (!existingNotification) {
        await createLowStockNotification(product);
      }
    }
  } catch (error) {
    console.error('Error checking low stock products:', error);
  }
};

module.exports = {
  createLowStockNotification,
  createNewOrderNotification,
  createProductAddedNotification,
  createDailySummaryNotification,
  createAISmartNotification,
  checkLowStockProducts,
};

