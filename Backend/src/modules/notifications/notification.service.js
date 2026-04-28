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

async function getMyNotifications({ tenantId, userId, limit, offset, filters }) {
  return notificationRepo.getUserNotifications({
    tenantId,
    userId,
    limit,
    offset,
    isRead: filters.is_read,
    type: filters.type,
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
    const notificationId = await notificationRepo.createNotification({
      tenantId,
      userId,
      title,
      message,
      type,
      metadata,
    });

    return {
      id: notificationId,
      tenant_id: tenantId,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      metadata,
      created_at: new Date(),
    };
  } catch (error) {
    console.error("Notification failed:", error);
    return null;
  }
}

module.exports = {
  notifyUser,
  getMyNotifications,
  getMyUnreadCount,
  readNotification,
  readAllNotifications,
};