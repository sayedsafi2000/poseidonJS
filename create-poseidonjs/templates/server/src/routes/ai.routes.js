const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/ai.controller');
const router = Router();

router.post('/', authenticate, authorize('admin', 'vendor'), controller.chatWithAI);

module.exports = router;

