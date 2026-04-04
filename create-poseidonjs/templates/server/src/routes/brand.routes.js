const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/brand.controller');

const router = Router();

// Public routes
router.get('/', controller.getAllBrands);
router.get('/:id', controller.getBrandById);

// Protected routes - Admin and Vendor
router.post('/', authenticate, authorize('admin', 'vendor'), controller.createBrand);
router.put('/:id', authenticate, authorize('admin', 'vendor'), controller.updateBrand);
router.delete('/:id', authenticate, authorize('admin', 'vendor'), controller.deleteBrand);

module.exports = router;

