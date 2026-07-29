const repo = require("./platform-notifications.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  listNotifications: ({ auth, query }) =>
    repo.listNotifications({
      platformUserId: auth.userId,
      page: Number(query.page || 1),
      limit: Math.min(Number(query.limit || 20), 100),
      severity: query.severity,
      type: query.type,
      unreadOnly:
        String(query.unreadOnly || "false") === "true",
    }),

  getNotification: async ({
    auth,
    notificationId,
  }) => {
    const notification =
      await repo.findNotificationById({
        notificationId,
        platformUserId: auth.userId,
      });

    if (!notification) {
      throw httpError(
        404,
        "Platform notification not found."
      );
    }

    return notification;
  },

  createNotification: async ({ body }) => {
    const notificationId =
      await repo.createNotification({
        type: body.type,
        severity: body.severity,
        title: body.title,
        message: body.message,
        tenantId: body.tenantId,
        entityType: body.entityType,
        entityId: body.entityId,
        recipientUserIds:
          body.recipientUserIds,
      });

    return { notificationId };
  },

  markRead: async ({
    auth,
    notificationId,
  }) => {
    const notification =
      await repo.findNotificationById({
        notificationId,
        platformUserId: auth.userId,
      });

    if (!notification) {
      throw httpError(
        404,
        "Platform notification not found."
      );
    }

    return repo.markRead({
      notificationId,
      platformUserId: auth.userId,
    });
  },

  markAllRead: async ({ auth }) => {
    await repo.markAllRead(auth.userId);

    return {
      unreadCount:
        await repo.countUnread(auth.userId),
    };
  },

  getUnreadCount: ({ auth }) =>
    repo.countUnread(auth.userId),
};
