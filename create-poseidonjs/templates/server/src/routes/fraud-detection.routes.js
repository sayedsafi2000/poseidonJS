const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/fraud-detection.controller');
const router = Router();

router.get('/fraud-check', authenticate, authorize('admin'), controller.checkFraud);
router.get('/vendor/:id/fraud-check', authenticate, authorize('admin'), controller.getVendorFraudCheck);

module.exports = router;

