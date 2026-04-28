const notificationRepo = require("./notification.repository");

async function notifyUser({
  tenantId,
  userId,
  title,
  message,
  type = "info",
  metadata,
}) {
  if (!tenantId || !userId || !title || !message) {
    return null;
  }

  try {
    return await notificationRepo.createNotification({
      tenantId,
      userId,
      title,
      message,
      type,
      metadata,
    });
  } catch (error) {
    console.error("Notification failed:", error);
    return null;
  }
}

async function getMyNotifications({ tenantId, userId, limit, offset }) {
  return notificationRepo.getUserNotifications({
    tenantId,
    userId,
    limit,
    offset,
  });
}

async function getMyUnreadCount({ tenantId, userId }) {
  return notificationRepo.getUnreadCount({ tenantId, userId });
}

async function readNotification({ tenantId, userId, notificationId }) {
  const updated = await notificationRepo.markAsRead({
    tenantId,
    userId,
    notificationId,
  });

  if (!updated) {
    throw new Error("Notification not found");
  }

  return true;
}

async function readAllNotifications({ tenantId, userId }) {
  return notificationRepo.markAllAsRead({ tenantId, userId });
}

module.exports = {
  notifyUser,
  getMyNotifications,
  getMyUnreadCount,
  readNotification,
  readAllNotifications,
};