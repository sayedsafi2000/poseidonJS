const express = require('express');
const { authenticate } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/:productId', authenticate, wishlistController.addToWishlist);
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

module.exports = router;
