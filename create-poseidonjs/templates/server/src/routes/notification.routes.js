const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/notification.controller');
const router = Router();

router.get('/', authenticate, authorize('admin', 'vendor'), controller.getAllNotifications);
router.get('/unread-count', authenticate, authorize('admin', 'vendor'), controller.getUnreadCount);
router.post('/create', authenticate, authorize('admin'), controller.createNotification);
router.patch('/mark-read', authenticate, authorize('admin', 'vendor'), controller.markAsRead);
router.patch('/mark-all-read', authenticate, authorize('admin', 'vendor'), controller.markAllAsRead);

module.exports = router;

