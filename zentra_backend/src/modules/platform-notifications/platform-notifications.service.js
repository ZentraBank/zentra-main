const repo =
  require("./platform-notifications.repository");

const notificationsRepo =
  require("../notifications/notifications.repository");

const webPushService =
  require("../../services/web-push.service");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sendTenantWebPush =
  async ({
    tenantId,
    userId,
    notificationId,
  }) => {
    try {
      /*
       * Load the notification that was already
       * committed to the normal notifications
       * table.
       */
      const notification =
        await notificationsRepo
          .findByIdWithConnection({
            connection:
              notificationsRepo.db,

            tenantId,
            notificationId,
          });

      if (!notification) {
        return {
          attempted: 0,
          delivered: 0,
          expired: 0,
          failed: 0,
        };
      }

      /*
       * A tenant administrator may have more
       * than one browser/device registered.
       */
      const subscriptions =
        await notificationsRepo
          .listActivePushSubscriptions({
            tenantId,
            userId,
          });

      if (subscriptions.length === 0) {
        return {
          attempted: 0,
          delivered: 0,
          expired: 0,
          failed: 0,
        };
      }

      return webPushService.sendToUser({
        subscriptions,
        notification,

        /*
         * Chrome/Edge push services return
         * 404/410 when a subscription has
         * permanently expired.
         */
        onExpired:
          async (subscription) => {
            await notificationsRepo
              .deactivatePushSubscriptionById({
                subscriptionId:
                  subscription.id,
              });
          },
      });
    } catch (error) {
      /*
       * Web Push is secondary delivery.
       *
       * The notification has already been
       * committed, so push failure must never
       * make the API request appear to have
       * failed.
       */
      console.error(
        "[WEB_PUSH] Tenant notification delivery failed:",
        {
          tenantId,
          userId,
          notificationId,
          message:
            error?.message,
        }
      );

      return {
        attempted: 0,
        delivered: 0,
        expired: 0,
        failed: 1,
      };
    }
  };

const sendToTenants = async ({
  auth,
  body,
}) => {
  const audienceType =
    body.audienceType;

  let tenantIds = [];

  /*
   * Resolve the requested tenant audience.
   */
  if (
    audienceType ===
    "single_tenant"
  ) {
    tenantIds = [
      body.tenantId,
    ];
  } else if (
    audienceType ===
    "selected_tenants"
  ) {
    tenantIds = [
      ...new Set(
        body.tenantIds || []
      ),
    ];
  } else if (
    audienceType ===
    "all_tenants"
  ) {
    tenantIds =
      await repo.listActiveTenantIds();
  } else {
    throw httpError(
      422,
      "Invalid tenant notification audience."
    );
  }

  tenantIds =
    tenantIds.filter(Boolean);

  if (tenantIds.length === 0) {
    throw httpError(
      422,
      "At least one tenant is required."
    );
  }

  /*
   * Resolve active tenant staff.
   *
   * The repository excludes customer/client
   * roles, so platform announcements cannot
   * accidentally reach banking customers.
   */
  const recipients =
    await repo.findActiveTenantStaff({
      tenantIds,
    });

  if (recipients.length === 0) {
    throw httpError(
      422,
      "No active tenant staff were found for the selected tenant audience."
    );
  }

  const connection =
    await repo.db.pool.getConnection();

  const created = [];

  try {
    await connection.beginTransaction();

    for (const recipient of recipients) {
      const notificationId =
        await repo.createTenantPlatformNotification({
          connection,

          tenantId:
            recipient.tenant_id,

          userId:
            recipient.user_id,

          title:
            body.title,

          message:
            body.message,

          priority:
            body.priority ||
            "normal",

          actionUrl:
            body.actionUrl ||
            null,

          entityType:
            body.entityType ||
            null,

          entityId:
            body.entityId ||
            null,

          metadata: {
            ...(body.metadata || {}),

            source:
              "platform",

            sentBy:
              auth.userId,
          },
        });

      created.push({
        notificationId,

        tenantId:
          recipient.tenant_id,

        userId:
          recipient.user_id,
      });
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  /*
 * Deliver only AFTER the database transaction
 * has successfully committed.
 *
 * Socket.IO handles active Zentra sessions.
 * Web Push handles browser/OS notifications.
 *
 * Neither transport can roll back the
 * notification that has already been saved.
 */

const pushSummary = {
  attempted: 0,
  delivered: 0,
  expired: 0,
  failed: 0,
};

for (const item of created) {
  /*
   * Existing realtime in-app delivery.
   */
  await repo
    .emitTenantPlatformNotification({
      tenantId:
        item.tenantId,

      userId:
        item.userId,

      notificationId:
        item.notificationId,
    });

  /*
   * Browser / OS Web Push delivery.
   */
  const pushResult =
    await sendTenantWebPush({
      tenantId:
        item.tenantId,

      userId:
        item.userId,

      notificationId:
        item.notificationId,
    });

  pushSummary.attempted +=
    pushResult.attempted;

  pushSummary.delivered +=
    pushResult.delivered;

  pushSummary.expired +=
    pushResult.expired;

  pushSummary.failed +=
    pushResult.failed;
}

  return {
  audienceType,

  tenantCount:
    new Set(
      created.map(
        (item) =>
          item.tenantId
      )
    ).size,

  recipientCount:
    created.length,

  notificationCount:
    created.length,

  push: {
    attempted:
      pushSummary.attempted,

    delivered:
      pushSummary.delivered,

    expired:
      pushSummary.expired,

    failed:
      pushSummary.failed,
  },
};
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

  sendToTenants,
};
