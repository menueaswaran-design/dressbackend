const reportService = require('../services/reportService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.sales = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await reportService.getSalesReport(startDate, endDate);
  ApiResponse.success(res, report);
});

exports.inventory = catchAsync(async (req, res) => {
  const report = await reportService.getInventoryReport();
  ApiResponse.success(res, report);
});

exports.customers = catchAsync(async (req, res) => {
  const report = await reportService.getCustomerReport();
  ApiResponse.success(res, report);
});

exports.coupons = catchAsync(async (req, res) => {
  const report = await reportService.getCouponReport();
  ApiResponse.success(res, report);
});
