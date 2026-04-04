const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/vendor-performance.controller');
const router = Router();

router.get('/performance', authenticate, authorize('admin', 'vendor'), controller.getVendorPerformance);
router.get('/ranking', authenticate, authorize('admin', 'vendor'), controller.getVendorRanking);

module.exports = router;

