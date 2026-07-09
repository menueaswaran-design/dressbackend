const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');

exports.getSalesReport = async (startDate, endDate) => {
  const match = { isDeleted: false, status: 'delivered' };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const sales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        totalDiscount: { $sum: '$discount' },
        avgOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const dailySales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { summary: sales[0] || {}, dailySales };
};

exports.getInventoryReport = async () => {
  const [totalProducts, lowStock, outOfStock, categoryStock] = await Promise.all([
    Product.countDocuments({ isDeleted: false }),
    Product.countDocuments({ isDeleted: false, $expr: { $and: [ { $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockLimit'] } ] } }),
    Product.countDocuments({ isDeleted: false, stock: 0 }),
    Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', productCount: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: '$category.name', productCount: 1, totalStock: 1 } },
    ]),
  ]);

  return { totalProducts, lowStock, outOfStock, categoryStock };
};

exports.getCustomerReport = async () => {
  const [total, active, returning, topCustomers] = await Promise.all([
    Customer.countDocuments({ isDeleted: false }),
    Customer.countDocuments({ isDeleted: false, isActive: true }),
    Customer.countDocuments({ totalOrders: { $gt: 1 }, isDeleted: false }),
    Customer.find({ isDeleted: false })
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('name email totalOrders totalSpent'),
  ]);

  return { totalCustomers: total, activeCustomers: active, returningCustomers: returning, topCustomers };
};

exports.getCouponReport = async () => {
  const [total, active, expired, usage] = await Promise.all([
    Coupon.countDocuments({ isDeleted: false }),
    Coupon.countDocuments({ isActive: true, isDeleted: false, expiresAt: { $gt: new Date() } }),
    Coupon.countDocuments({ expiresAt: { $lt: new Date() }, isDeleted: false }),
    Coupon.find({ isDeleted: false }).sort({ usedCount: -1 }).limit(10).select('code type value usedCount'),
  ]);

  return { totalCoupons: total, activeCoupons: active, expiredCoupons: expired, mostUsed: usage };
};

exports.getDashboardCharts = async () => {
  const [monthlySales, ordersByStatus, topSelling, categorySales] = await Promise.all([
    Order.aggregate([
      { $match: { isDeleted: false, status: 'delivered' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Order.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isDeleted: false, status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$product.name', totalSold: 1, revenue: 1 } },
    ]),
    Order.aggregate([
      { $match: { isDeleted: false, status: 'delivered' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$category.name', revenue: { $sum: '$items.total' }, count: { $sum: '$items.quantity' } } },
    ]),
  ]);

  return { monthlySales, ordersByStatus, topSelling: topSelling || [], categorySales };
};
