const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { generateOrderNumber, getPaginationMeta } = require('../utils/helpers');

exports.createOrder = async (data) => {
  const orderNumber = generateOrderNumber();
  const order = await Order.create({ ...data, orderNumber });

  await Customer.findByIdAndUpdate(data.customer, {
    $push: { orderHistory: order._id },
    $inc: { totalOrders: 1, totalSpent: data.total },
  });

  return order;
};

exports.createOrderFromCart = async (customer, shippingAddress, paymentMethod) => {
  if (!customer.cart || customer.cart.length === 0) {
    throw require('../utils/ApiError').badRequest('Cart is empty');
  }

  const productIds = customer.cart.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  for (const item of customer.cart) {
    const product = productMap[item.product?.toString() || item._id?.toString()];
    if (!product) throw require('../utils/ApiError').badRequest(`Product not found: ${item.name}`);
    const variant = product.variants?.find((v) => v.size === item.size);
    const availableStock = variant?.stock ?? product.stock;
    if (item.quantity > availableStock) {
      throw require('../utils/ApiError').badRequest(`Insufficient stock for ${product.name} (${item.size || 'N/A'})`);
    }
  }

  const subtotal = customer.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharge = subtotal >= 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCharge + tax;

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    customer: customer._id,
    items: customer.cart.map((item) => ({
      product: item.product || item._id,
      variant: { size: item.size || '', color: item.color || '', sku: '' },
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    subtotal,
    shippingCharge,
    tax,
    total,
    shippingAddress: {
      name: shippingAddress?.name || '',
      phone: shippingAddress?.phone || '',
      address: shippingAddress?.address || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zip: shippingAddress?.zip || '',
      country: shippingAddress?.country || 'India',
    },
    paymentInfo: {
      method: paymentMethod || 'cod',
      status: 'pending',
    },
    status: 'pending',
  });

  customer.cart = [];
  await customer.save();

  await Customer.findByIdAndUpdate(customer._id, {
    $push: { orderHistory: order._id },
    $inc: { totalOrders: 1, totalSpent: total },
  });

  return Order.findById(order._id).populate('items.product', 'name images slug');
};

exports.getOrderById = async (id) => {
  return Order.findById(id).populate('customer', 'name email phone').populate('items.product', 'name images');
};

exports.getOrderByNumber = async (orderNumber) => {
  return Order.findOne({ orderNumber }).populate('customer', 'name email phone').populate('items.product', 'name images');
};

exports.listOrders = async (query) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, status, startDate, endDate, paymentStatus } = query;
  const filter = { isDeleted: false };

  if (search) filter.orderNumber = { $regex: search, $options: 'i' };
  if (status) filter.status = status;
  if (paymentStatus) filter['paymentInfo.status'] = paymentStatus;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('customer', 'name email phone')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { orders, pagination: getPaginationMeta(total, page, limit) };
};

exports.listCustomerOrders = async (customerId, query) => {
  const { page = 1, limit = 10 } = query;
  const filter = { customer: customerId, isDeleted: false };
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('items.product', 'name images slug');
  return { orders, pagination: getPaginationMeta(total, page, limit) };
};

exports.getCustomerOrder = async (customerId, orderId) => {
  return Order.findOne({ _id: orderId, customer: customerId, isDeleted: false })
    .populate('items.product', 'name images slug');
};

exports.updateOrderStatus = async (id, status, notes) => {
  const update = { status };
  if (notes) update.notes = notes;
  return Order.findByIdAndUpdate(id, { $set: update }, { new: true });
};

exports.updatePaymentStatus = async (id, paymentStatus, transactionId) => {
  const update = { 'paymentInfo.status': paymentStatus };
  if (transactionId) update['paymentInfo.transactionId'] = transactionId;
  return Order.findByIdAndUpdate(id, { $set: update }, { new: true });
};

exports.deleteOrder = async (id) => {
  return Order.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

exports.getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, pendingOrders, completedOrders, cancelledOrders, totalRevenue, todayRevenue, stats] = await Promise.all([
    Order.countDocuments({ isDeleted: false }),
    Order.countDocuments({ status: 'pending', isDeleted: false }),
    Order.countDocuments({ status: 'delivered', isDeleted: false }),
    Order.countDocuments({ status: 'cancelled', isDeleted: false }),
    Order.aggregate([{ $match: { isDeleted: false, status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { isDeleted: false, createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    monthlyStats: stats,
  };
};
