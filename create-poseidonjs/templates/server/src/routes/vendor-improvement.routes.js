const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/vendor-improvement.controller');
const router = Router();

router.get('/:id/improvement-tips', authenticate, authorize('admin', 'vendor'), controller.getImprovementTips);

module.exports = router;

