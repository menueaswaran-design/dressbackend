const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  await notificationService.sendOrderNotification(order);
  ApiResponse.created(res, { order }, 'Order created');
});

exports.get = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ApiResponse.success(res, { order });
});

exports.getByNumber = catchAsync(async (req, res) => {
  const order = await orderService.getOrderByNumber(req.params.orderNumber);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ApiResponse.success(res, { order });
});

exports.list = catchAsync(async (req, res) => {
  const data = await orderService.listOrders(req.query);
  ApiResponse.paginated(res, data.orders, data.pagination);
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, notes);
  ApiResponse.success(res, { order }, 'Order status updated');
});

exports.updatePayment = catchAsync(async (req, res) => {
  const { status, transactionId } = req.body;
  const order = await orderService.updatePaymentStatus(req.params.id, status, transactionId);
  ApiResponse.success(res, { order }, 'Payment status updated');
});

exports.remove = catchAsync(async (req, res) => {
  await orderService.deleteOrder(req.params.id);
  ApiResponse.noContent(res, 'Order deleted');
});

exports.checkout = catchAsync(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const order = await orderService.createOrderFromCart(req.customer, shippingAddress, paymentMethod);
  ApiResponse.created(res, { order }, 'Order placed successfully');
});

exports.myOrders = catchAsync(async (req, res) => {
  const data = await orderService.listCustomerOrders(req.customer._id, req.query);
  ApiResponse.paginated(res, data.orders, data.pagination);
});

exports.myOrder = catchAsync(async (req, res) => {
  const order = await orderService.getCustomerOrder(req.customer._id, req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ApiResponse.success(res, { order });
});
