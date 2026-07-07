const Notification = require('../models/Notification');
const { getPaginationMeta } = require('../utils/helpers');

exports.createNotification = async (data) => {
  return Notification.create(data);
};

exports.listNotifications = async (query) => {
  const { page = 1, limit = 20, recipient, recipientId, isRead } = query;
  const filter = {};

  if (recipient) filter.recipient = recipient;
  if (recipientId) filter.recipientId = recipientId;
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { notifications, pagination: getPaginationMeta(total, page, limit), unreadCount: await Notification.countDocuments({ ...filter, isRead: false }) };
};

exports.markAsRead = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

exports.markAllAsRead = async (recipient, recipientId) => {
  return Notification.updateMany({ recipient, recipientId, isRead: false }, { isRead: true });
};

exports.getUnreadCount = async (recipient, recipientId) => {
  return Notification.countDocuments({ recipient, recipientId, isRead: false });
};

exports.sendOrderNotification = async (order) => {
  await this.createNotification({
    type: 'new_order',
    title: 'New Order Received',
    message: `Order ${order.orderNumber} has been placed for ₹${order.total}`,
    recipient: 'admin',
    referenceId: order._id,
    referenceType: 'Order',
  });
};

exports.sendLowStockNotification = async (product) => {
  await this.createNotification({
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `Product "${product.name}" has only ${product.stock} units left`,
    recipient: 'admin',
    referenceId: product._id,
    referenceType: 'Product',
  });
};
