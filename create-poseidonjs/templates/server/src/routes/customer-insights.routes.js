const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/customer-insights.controller');
const router = Router();

router.get('/customer-insights', authenticate, authorize('admin', 'vendor'), controller.getCustomerInsights);

module.exports = router;

