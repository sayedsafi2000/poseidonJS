const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/ai-summary.controller');
const router = Router();

router.get('/:period', authenticate, authorize('admin', 'vendor'), controller.getBusinessSummary);

module.exports = router;

