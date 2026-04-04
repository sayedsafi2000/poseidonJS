const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/collection.controller');
const router = Router();

router.get('/', controller.getAllCollections);
router.get('/:id', controller.getCollectionById);
router.post('/', authenticate, authorize('admin'), controller.createCollection);
router.put('/:id', authenticate, authorize('admin'), controller.updateCollection);
router.delete('/:id', authenticate, authorize('admin'), controller.deleteCollection);

module.exports = router;
