const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/vendor-ai.controller');
const router = Router();

router.post('/write', authenticate, authorize('admin', 'vendor'), controller.generateContent);
router.post('/seo', authenticate, authorize('admin', 'vendor'), controller.generateSEO);
router.post('/adcopy', authenticate, authorize('admin', 'vendor'), controller.generateAdCopy);
router.post('/translate', authenticate, authorize('admin', 'vendor'), controller.translateContent);

module.exports = router;

