const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/pricing-analysis.controller');
const router = Router();

router.post('/analysis', authenticate, authorize('admin', 'vendor'), controller.analyzePricing);

module.exports = router;

