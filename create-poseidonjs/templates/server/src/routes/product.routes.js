const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/product.controller');
const router = Router();

// Optional authentication for vendor filtering
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      
      try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          };
        }
      } catch (err) {
        // Token invalid, continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

router.get('/', optionalAuth, controller.getAllProducts);
router.get('/:id', optionalAuth, controller.getProductById);
router.post('/', authenticate, authorize('admin', 'vendor'), controller.createProduct);
router.put('/:id', authenticate, authorize('admin', 'vendor'), controller.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), controller.deleteProduct);

module.exports = router;
