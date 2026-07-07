const orderService = require('../services/orderService');
const customerService = require('../services/customerService');
const productService = require('../services/productService');
const reportService = require('../services/reportService');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getStats = catchAsync(async (req, res) => {
  const [orderStats, totalCustomers, returningCustomers, totalProducts, lowStock, outOfStock] = await Promise.all([
    orderService.getDashboardStats(),
    customerService.getTotalCustomers(),
    customerService.getReturningCustomers(),
    Product.countDocuments({ isDeleted: false }),
    productService.getLowStockProducts(),
    productService.getOutOfStockProducts(),
  ]);

  ApiResponse.success(res, {
    ...orderStats,
    totalCustomers,
    returningCustomers,
    totalProducts,
    lowStockProducts: lowStock?.length || 0,
    outOfStockProducts: outOfStock?.length || 0,
  });
});

exports.getCharts = catchAsync(async (req, res) => {
  const charts = await reportService.getDashboardCharts();
  ApiResponse.success(res, charts);
});
