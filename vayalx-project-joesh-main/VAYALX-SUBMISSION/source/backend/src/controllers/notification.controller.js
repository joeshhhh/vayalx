// VAYALX Notification Controller (Phase 4)
const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middleware/error.middleware');

class NotificationController {
  getMyNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getUserNotifications(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
      pagination: result.pagination
    });
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const result = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json({
      success: true,
      data: result
    });
  });

  markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });
  });
}

module.exports = new NotificationController();
