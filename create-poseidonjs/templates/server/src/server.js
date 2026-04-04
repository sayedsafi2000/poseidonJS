const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const collectionRoutes = require('./routes/collection.routes');
const brandRoutes = require('./routes/brand.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const promotionRoutes = require('./routes/promotion.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const uploadRoutes = require('./routes/upload.routes');
const bannerRoutes = require('./routes/banner.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const notificationRoutes = require('./routes/notification.routes');
const aiRoutes = require('./routes/ai.routes');
const aiSummaryRoutes = require('./routes/ai-summary.routes');
const reviewAnalysisRoutes = require('./routes/review-analysis.routes');
const fraudDetectionRoutes = require('./routes/fraud-detection.routes');
const vendorPerformanceRoutes = require('./routes/vendor-performance.routes');
const inventoryCleanupRoutes = require('./routes/inventory-cleanup.routes');
const pricingAnalysisRoutes = require('./routes/pricing-analysis.routes');
const vendorAIRoutes = require('./routes/vendor-ai.routes');
const autoReplyRoutes = require('./routes/auto-reply.routes');
const vendorImprovementRoutes = require('./routes/vendor-improvement.routes');
const customerInsightsRoutes = require('./routes/customer-insights.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poseidonjs');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute (very generous for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN_FRONTEND || 'http://localhost:3000',
    process.env.CORS_ORIGIN_ADMIN || 'http://localhost:3001',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-summary', aiSummaryRoutes);
app.use('/api/reviews', reviewAnalysisRoutes);
app.use('/api/ai', fraudDetectionRoutes);
app.use('/api/vendors', vendorPerformanceRoutes);
app.use('/api/products', inventoryCleanupRoutes);
app.use('/api/pricing', pricingAnalysisRoutes);
app.use('/api/vendor/ai', vendorAIRoutes);
app.use('/api/customer', autoReplyRoutes);
app.use('/api/vendor', vendorImprovementRoutes);
app.use('/api/ai', customerInsightsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize daily summary scheduler
    const dailySummaryService = require('./services/daily-summary.service');
    dailySummaryService.scheduleDailySummary();
  });
};

startServer();

module.exports = app;

