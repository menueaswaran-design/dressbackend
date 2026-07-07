const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.list = catchAsync(async (req, res) => {
  const data = await notificationService.listNotifications(req.query);
  ApiResponse.paginated(res, data.notifications, data.pagination);
});

exports.markRead = catchAsync(async (req, res) => {
  await notificationService.markAsRead(req.params.id);
  ApiResponse.success(res, null, 'Notification marked as read');
});

exports.markAllRead = catchAsync(async (req, res) => {
  const { recipient, recipientId } = req.body;
  await notificationService.markAllAsRead(recipient, recipientId);
  ApiResponse.success(res, null, 'All notifications marked as read');
});

exports.unreadCount = catchAsync(async (req, res) => {
  const { recipient, recipientId } = req.query;
  const count = await notificationService.getUnreadCount(recipient, recipientId);
  ApiResponse.success(res, { count });
});
