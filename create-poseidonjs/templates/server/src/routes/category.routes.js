const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/category.controller');
const router = Router();

router.get('/', controller.getAllCategories);
router.get('/:id', controller.getCategoryById);
router.post('/', authenticate, authorize('admin', 'vendor'), controller.createCategory);
router.put('/:id', authenticate, authorize('admin', 'vendor'), controller.updateCategory);
router.delete('/:id', authenticate, authorize('admin', 'vendor'), controller.deleteCategory);

module.exports = router;
