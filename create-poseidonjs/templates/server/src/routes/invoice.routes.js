const { Router } = require('express');
const controller = require('../controllers/invoice.controller');
const router = Router();
router.get('/:id', controller.getInvoice);
module.exports = router;
