const { Router } = require('express');
const controller = require('../controllers/customer.controller');
const router = Router();
router.get('/', controller.getAllCustomers);
module.exports = router;
