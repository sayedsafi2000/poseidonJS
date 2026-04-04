const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/promotion.controller');
const router = Router();

router.get('/', controller.getAllPromotions);
router.get('/:id', controller.getPromotionById);
router.post('/', authenticate, authorize('admin'), controller.createPromotion);
router.put('/:id', authenticate, authorize('admin'), controller.updatePromotion);
router.delete('/:id', authenticate, authorize('admin'), controller.deletePromotion);

module.exports = router;
