const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/review-analysis.controller');
const router = Router();

router.get('/analyze', authenticate, authorize('admin', 'vendor'), controller.analyzeReviews);
router.get('/vendor/:id/review-analysis', authenticate, authorize('admin', 'vendor'), controller.getVendorReviewAnalysis);

module.exports = router;

