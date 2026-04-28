const notificationService = require("./notification.service");

async function getMyNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getMyNotifications({
      tenantId: req.tenant.id,
      userId: req.user.id,
      limit: req.query.limit,
      offset: req.query.offset,
    });

    return res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const unreadCount = await notificationService.getMyUnreadCount({
      tenantId: req.tenant.id,
      userId: req.user.id,
    });

    return res.json({
      success: true,
      data: { unread_count: unreadCount },
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    await notificationService.readNotification({
      tenantId: req.tenant.id,
      userId: req.user.id,
      notificationId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const count = await notificationService.readAllNotifications({
      tenantId: req.tenant.id,
      userId: req.user.id,
    });

    return res.json({
      success: true,
      message: "All notifications marked as read",
      data: { updated_count: count },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};