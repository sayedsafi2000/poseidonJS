const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/analytics.controller');
const router = Router();

router.get('/', authenticate, authorize('admin', 'vendor'), controller.getAnalytics);
router.get('/dashboard', authenticate, authorize('admin', 'vendor'), controller.getDashboardAnalytics);
router.get('/sales', authenticate, authorize('admin', 'vendor'), controller.getSalesAnalytics);
router.get('/products', authenticate, authorize('admin', 'vendor'), controller.getProductAnalytics);

module.exports = router;
