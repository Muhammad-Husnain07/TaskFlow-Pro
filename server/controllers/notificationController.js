const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const queryBuilder = require('../utils/queryBuilder');

const getNotifications = asyncHandler(async (req, res, next) => {
  const { page, limit, unread } = req.query;
  
  const qb = queryBuilder(Notification, req.query, ['message']);
  qb.query.recipient = req.user.id;
  
  if (unread === 'true') {
    qb.query.read = false;
  }

  const result = await qb.runQuery();
  result.data = await Notification.populate(result.data, [
    { path: 'sender', select: 'name email avatar' },
    { path: 'relatedTask', select: 'title' },
    { path: 'relatedProject', select: 'name' }
  ]);

  return ApiResponse.paginated(res, result.data, result.pagination, 'Notifications retrieved successfully');
});

const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    read: false
  });

  return ApiResponse.success(res, { count }, 'Unread count retrieved successfully');
});

const markRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, notification, 'Notification marked as read');
});

const markAllRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );

  return ApiResponse.success(res, null, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, null, 'Notification deleted successfully');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification
};