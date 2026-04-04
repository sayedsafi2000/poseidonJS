const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/auto-reply.controller');
const router = Router();

router.post('/auto-reply', authenticate, authorize('admin', 'vendor'), controller.generateAutoReply);

module.exports = router;

