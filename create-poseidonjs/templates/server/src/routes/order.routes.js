const { Router } = require('express');
const controller = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');
const router = Router();

// Customer routes
router.post('/', authenticate, controller.createOrder);
router.get('/my-orders', authenticate, controller.getMyOrders);
// Must be before /:id so "track" is not captured as an id
router.get('/track', controller.trackOrder);

// Single order: customer (own), admin, vendor (with their products) — handled in controller
router.get('/:id', authenticate, controller.getOrderById);

// Admin/Vendor list
router.get('/', authenticate, authorize('admin', 'vendor'), controller.getAllOrders);
router.put('/:id/invoice-status', authenticate, authorize('admin', 'vendor'), controller.updateInvoiceStatus);
router.put('/:id/status', authenticate, authorize('admin', 'vendor'), controller.updateOrderStatus);

module.exports = router;
