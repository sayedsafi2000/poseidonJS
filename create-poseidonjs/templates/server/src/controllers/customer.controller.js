const { ApiError } = require('../middleware/errorHandler');

const getAllCustomers = async (req, res, next) => {
  res.json({ success: true, message: 'Customer controller - coming soon', data: [] });
};

module.exports = { getAllCustomers };
