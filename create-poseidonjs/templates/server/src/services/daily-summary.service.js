const cron = require('node-cron');
const notificationService = require('./notification.service');

/**
 * Schedule daily summary notification
 * Runs every day at 9:00 AM
 */
const scheduleDailySummary = () => {
  // Run at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('📊 Generating daily summary notification...');
    try {
      await notificationService.createDailySummaryNotification();
      console.log('✅ Daily summary notification created');
    } catch (error) {
      console.error('❌ Error creating daily summary notification:', error);
    }
  });

  // Also check for low stock products every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🔍 Checking for low stock products...');
    try {
      await notificationService.checkLowStockProducts();
    } catch (error) {
      console.error('❌ Error checking low stock products:', error);
    }
  });

  console.log('✅ Daily summary scheduler initialized');
};

module.exports = {
  scheduleDailySummary,
};

