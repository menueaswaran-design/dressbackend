const customerService = require('../services/customerService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.list = catchAsync(async (req, res) => {
  const data = await customerService.listCustomers(req.query);
  ApiResponse.paginated(res, data.customers, data.pagination);
});

exports.get = catchAsync(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  ApiResponse.success(res, { customer });
});

exports.update = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  ApiResponse.success(res, { customer }, 'Customer updated');
});

exports.remove = catchAsync(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  ApiResponse.noContent(res, 'Customer deleted');
});
