#!/bin/bash

# Create stub controllers for remaining files
cat > src/controllers/user.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllUsers = async (req, res, next) => {
  res.json({ success: true, message: 'User controller - coming soon', data: [] });
};

module.exports = { getAllUsers };
EOF

cat > src/controllers/product.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllProducts = async (req, res, next) => {
  res.json({ success: true, message: 'Product controller - coming soon', data: [] });
};

module.exports = { getAllProducts };
EOF

cat > src/controllers/category.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllCategories = async (req, res, next) => {
  res.json({ success: true, message: 'Category controller - coming soon', data: [] });
};

module.exports = { getAllCategories };
EOF

cat > src/controllers/collection.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllCollections = async (req, res, next) => {
  res.json({ success: true, message: 'Collection controller - coming soon', data: [] });
};

module.exports = { getAllCollections };
EOF

cat > src/controllers/order.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllOrders = async (req, res, next) => {
  res.json({ success: true, message: 'Order controller - coming soon', data: [] });
};

module.exports = { getAllOrders };
EOF

cat > src/controllers/customer.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllCustomers = async (req, res, next) => {
  res.json({ success: true, message: 'Customer controller - coming soon', data: [] });
};

module.exports = { getAllCustomers };
EOF

cat > src/controllers/promotion.controller.js << 'EOF'
const { ApiError } = require('../middleware/errorHandler');

const getAllPromotions = async (req, res, next) => {
  res.json({ success: true, message: 'Promotion controller - coming soon', data: [] });
};

module.exports = { getAllPromotions };
EOF

cat > src/controllers/analytics.controller.js << 'EOF'
const getAnalytics = async (req, res, next) => {
  res.json({ success: true, message: 'Analytics controller - coming soon', data: {} });
};

module.exports = { getAnalytics };
EOF

cat > src/controllers/upload.controller.js << 'EOF'
const uploadImage = async (req, res, next) => {
  res.json({ success: true, message: 'Upload controller - coming soon', url: '' });
};

module.exports = { uploadImage };
EOF

cat > src/controllers/banner.controller.js << 'EOF'
const getAllBanners = async (req, res, next) => {
  res.json({ success: true, message: 'Banner controller - coming soon', data: [] });
};

module.exports = { getAllBanners };
EOF

cat > src/controllers/invoice.controller.js << 'EOF'
const getInvoice = async (req, res, next) => {
  res.json({ success: true, message: 'Invoice controller - coming soon', data: {} });
};

module.exports = { getInvoice };
EOF

# Create stub routes
cat > src/routes/user.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/user.controller');
const router = Router();
router.get('/', controller.getAllUsers);
module.exports = router;
EOF

cat > src/routes/product.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/product.controller');
const router = Router();
router.get('/', controller.getAllProducts);
module.exports = router;
EOF

cat > src/routes/category.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/category.controller');
const router = Router();
router.get('/', controller.getAllCategories);
module.exports = router;
EOF

cat > src/routes/collection.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/collection.controller');
const router = Router();
router.get('/', controller.getAllCollections);
module.exports = router;
EOF

cat > src/routes/order.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/order.controller');
const router = Router();
router.get('/', controller.getAllOrders);
module.exports = router;
EOF

cat > src/routes/customer.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/customer.controller');
const router = Router();
router.get('/', controller.getAllCustomers);
module.exports = router;
EOF

cat > src/routes/promotion.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/promotion.controller');
const router = Router();
router.get('/', controller.getAllPromotions);
module.exports = router;
EOF

cat > src/routes/analytics.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/analytics.controller');
const router = Router();
router.get('/', controller.getAnalytics);
module.exports = router;
EOF

cat > src/routes/upload.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/upload.controller');
const router = Router();
router.post('/', controller.uploadImage);
module.exports = router;
EOF

cat > src/routes/banner.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/banner.controller');
const router = Router();
router.get('/', controller.getAllBanners);
module.exports = router;
EOF

cat > src/routes/invoice.routes.js << 'EOF'
const { Router } = require('express');
const controller = require('../controllers/invoice.controller');
const router = Router();
router.get('/:id', controller.getInvoice);
module.exports = router;
EOF

echo "✅ All JavaScript files created!"

