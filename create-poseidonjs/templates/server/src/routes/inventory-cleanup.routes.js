const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/inventory-cleanup.controller');
const router = Router();

router.get('/cleanup-suggestions', authenticate, authorize('admin', 'vendor'), controller.getCleanupSuggestions);

module.exports = router;

