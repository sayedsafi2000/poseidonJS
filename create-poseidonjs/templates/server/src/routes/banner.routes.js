const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/banner.controller');
const router = Router();

router.get('/', controller.getAllBanners);
router.get('/:id', controller.getBannerById);
router.post('/', authenticate, authorize('admin'), controller.createBanner);
router.put('/:id', authenticate, authorize('admin'), controller.updateBanner);
router.delete('/:id', authenticate, authorize('admin'), controller.deleteBanner);

module.exports = router;
