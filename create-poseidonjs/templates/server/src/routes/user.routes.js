const { Router } = require('express');
const controller = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const router = Router();

router.get('/', authenticate, authorize('admin'), controller.getAllUsers);
router.get('/vendors', authenticate, authorize('admin'), controller.getVendors);
router.put('/:id/status', authenticate, authorize('admin'), controller.updateUserStatus);
router.patch('/:id/verify', authenticate, authorize('admin'), controller.verifyVendor);

module.exports = router;
