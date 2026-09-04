const repo =
  require("./notifications.repository");

const subscriptionService =
  require(
    "../subscriptions/subscriptions.service"
  );

const httpError = (statusCode,message) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const getPushNotificationQuota =
  async ({
    tenantId,
  }) => {
    const {
      subscription,
      entitlements,
    } =
      await subscriptionService
        .getTenantEntitlements({
          tenantId,
        });

    if (!subscription) {
      throw httpError(
        403,
        "An active subscription is required"
      );
    }

    if (
      entitlements
        .push_notifications !==
      true
    ) {
      throw httpError(
        403,
        "Push notifications are not included in your current subscription plan"
      );
    }

    const rawLimit =
      entitlements
        .push_notification_limit;

    /*
     * null means unlimited.
     */
    if (rawLimit === null) {
      return {
        subscription,
        limit: null,
      };
    }

    const limit =
      Number(rawLimit);

    if (
      !Number.isFinite(limit) ||
      limit < 0
    ) {
      throw httpError(
        500,
        "Invalid push notification limit configuration"
      );
    }

    return {
      subscription,
      limit,
    };
  };

const listMine = ({ auth, page = 1, pageSize = 20 }) => {
  const safePage =
    Number.isInteger(page) && page > 0 ? page : 1;

  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 100)
      : 20;

  const offset = (safePage - 1) * safePageSize;

  return repo.listByUser({
    tenantId: auth.tenantId,
    userId: auth.userId,
    limit: safePageSize,
    offset,
  });
};

const unreadCount = ({auth}) =>
  repo.countUnread({tenantId:auth.tenantId,userId:auth.userId});

const markRead = async ({auth,notificationId}) => {
  const item = await repo.findById({tenantId:auth.tenantId,notificationId});
  if (!item || item.user_id !== auth.userId) throw httpError(404,"Notification not found");
  await repo.markRead({tenantId:auth.tenantId,userId:auth.userId,notificationId});
  return repo.findById({tenantId:auth.tenantId,notificationId});
};

const markAllRead = async ({auth}) => {
  const [result] = await repo.markAllRead({
    tenantId:auth.tenantId,userId:auth.userId
  });
  return {updatedCount:result.affectedRows};
};

const archive = async ({auth,notificationId}) => {
  const item = await repo.findById({tenantId:auth.tenantId,notificationId});
  if (!item || item.user_id !== auth.userId) throw httpError(404,"Notification not found");
  await repo.archive({tenantId:auth.tenantId,userId:auth.userId,notificationId});
  return repo.findById({tenantId:auth.tenantId,notificationId});
};

const broadcast =
  async ({
    auth,
    body,
  }) => {
    const recipients =
      await repo.audienceUsers({
        tenantId:
          auth.tenantId,

        audienceType:
          body.audienceType,

        audienceValue:
          body.audienceValue,
      });

    if (
      !recipients.length
    ) {
      throw httpError(
        404,
        "No users matched the audience"
      );
    }

    const result =
      await createTenantNotificationsWithQuota({
        auth,
        recipients,

        notificationType:
          "admin_broadcast",

        buildNotification:
          () => ({
            notificationType:
              "admin_broadcast",

            title:
              body.title,

            message:
              body.message,

            priority:
              body.priority,

            actionUrl:
              body.actionUrl,

            metadata: {
              audienceType:
                body.audienceType,

              audienceValue:
                body.audienceValue ||
                null,

              sentBy:
                auth.userId,
            },
          }),
      });

    return {
      recipientCount:
        result.sentCount,
    };
  };

const notifyUser = (payload) => repo.create(payload);

const replaceTemplateVariables =
  (
    text,
    variables
  ) => {
    if (!text) {
      return text;
    }

    return text.replace(
      /\{\{(\w+)\}\}/g,
      (
        match,
        key
      ) => {
        const value =
          variables[key];

        return (
          value === undefined ||
          value === null
            ? match
            : String(value)
        );
      }
    );
  };
const createTemplate =
  ({
    auth,
    body,
  }) =>
    repo.createTemplate({
      tenantId:
        auth.tenantId,

      createdBy:
        auth.userId,

      body,
    });

const listTemplates =
  ({
    auth,
    query = {},
  }) =>
    repo.listTemplates({
      tenantId:
        auth.tenantId,

      status:
        query.status ||
        "active",
    });

const updateTemplate =
  async ({
    auth,
    templateId,
    body,
  }) => {
    const template =
      await repo.findTemplateById({
        tenantId:
          auth.tenantId,

        templateId,
      });

    if (!template) {
      throw httpError(
        404,
        "Notification template not found"
      );
    }

    return repo.updateTemplate({
      tenantId:
        auth.tenantId,

      templateId,
      body,
    });
  };

const deleteTemplate =
  async ({
    auth,
    templateId,
  }) => {
    const template =
      await repo.findTemplateById({
        tenantId:
          auth.tenantId,

        templateId,
      });

    if (!template) {
      throw httpError(
        404,
        "Notification template not found"
      );
    }

    await repo.deleteTemplate({
      tenantId:
        auth.tenantId,

      templateId,
    });

    return {
      deleted:
        true,
    };
  };

  const sendToClients =
  async ({
    auth,
    body,
  }) => {
    let template =
      null;

    if (
      body.templateId
    ) {
      template =
        await repo.findTemplateById({
          tenantId:
            auth.tenantId,

          templateId:
            body.templateId,
        });

      if (!template) {
        throw httpError(
          404,
          "Notification template not found"
        );
      }
    }

    let recipients =
      [];

    if (
      body.audienceType ===
      "user"
    ) {
      const client =
        await repo.findTenantClientById({
          tenantId:
            auth.tenantId,

          userId:
            body.userId,
        });

      if (client) {
        recipients = [
          client,
        ];
      }
    }

    if (
      body.audienceType ===
      "users"
    ) {
      recipients =
        await repo.findTenantClientsByIds({
          tenantId:
            auth.tenantId,

          userIds:
            body.userIds,
        });
    }

    if (
      body.audienceType ===
      "all_clients"
    ) {
      recipients =
        await repo.findAllTenantClients({
          tenantId:
            auth.tenantId,
        });
    }

    if (
      recipients.length ===
      0
    ) {
      throw httpError(
        404,
        "No clients matched the selected audience"
      );
    }

    const baseTitle =
      body.title ||
      template?.title;

    const baseMessage =
      body.message ||
      template?.message;

    if (
      !baseTitle ||
      !baseMessage
    ) {
      throw httpError(
        422,
        "Notification title and message are required"
      );
    }

  return createTenantNotificationsWithQuota({
  auth,

  recipients,

  buildNotification:
    (recipient) => {
      const variables = {
        firstName:
          recipient.first_name ||
          "",

        lastName:
          recipient.last_name ||
          "",

        email:
          recipient.email ||
          "",

        tenantName:
          body.tenantName ||
          "",
      };

      const title =
        replaceTemplateVariables(
          baseTitle,
          variables
        );

      const message =
        replaceTemplateVariables(
          baseMessage,
          variables
        );

      return {
        notificationType:
          "tenant_notification",

        title,

        message,

        priority:
          body.priority ||
          template?.priority ||
          "normal",

        actionUrl:
          body.actionUrl ??
          template?.action_url ??
          null,

        metadata: {
          sentBy:
            auth.userId,

          templateId:
            template?.id ||
            null,

          audienceType:
            body.audienceType,
        },
      };
    },
});
  };

  const getBillingPeriod =
  ({
    subscription,
  }) => {
    const anchor =
      subscription.starts_at ||
      subscription.created_at;

    if (!anchor) {
      throw httpError(
        500,
        "Subscription billing period could not be determined"
      );
    }

    const anchorDate =
      new Date(anchor);

    if (
      Number.isNaN(
        anchorDate.getTime()
      )
    ) {
      throw httpError(
        500,
        "Invalid subscription billing start date"
      );
    }

    const now =
      new Date();

    let periodStart =
      new Date(anchorDate);

    while (
      new Date(
        periodStart.getFullYear(),
        periodStart.getMonth() + 1,
        periodStart.getDate(),
        periodStart.getHours(),
        periodStart.getMinutes(),
        periodStart.getSeconds(),
        periodStart.getMilliseconds()
      ) <= now
    ) {
      periodStart =
        new Date(
          periodStart.getFullYear(),
          periodStart.getMonth() + 1,
          periodStart.getDate(),
          periodStart.getHours(),
          periodStart.getMinutes(),
          periodStart.getSeconds(),
          periodStart.getMilliseconds()
        );
    }

    if (
      periodStart > now
    ) {
      periodStart =
        new Date(
          periodStart.getFullYear(),
          periodStart.getMonth() - 1,
          periodStart.getDate(),
          periodStart.getHours(),
          periodStart.getMinutes(),
          periodStart.getSeconds(),
          periodStart.getMilliseconds()
        );
    }

    const periodEnd =
      new Date(
        periodStart.getFullYear(),
        periodStart.getMonth() + 1,
        periodStart.getDate(),
        periodStart.getHours(),
        periodStart.getMinutes(),
        periodStart.getSeconds(),
        periodStart.getMilliseconds()
      );

    return {
      periodStart,
      periodEnd,
    };
  };

  const createTenantNotificationsWithQuota =
  async ({
    auth,
    recipients,
    notificationType,
    buildNotification,
  }) => {
    if (
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return {
        sentCount: 0,
      };
    }

    const {
      subscription,
      limit,
    } =
      await getPushNotificationQuota({
        tenantId:
          auth.tenantId,
      });

    const {
      periodStart,
      periodEnd,
    } =
      getBillingPeriod({
        subscription,
      });

    const connection =
      await repo.db.pool.getConnection();

    const created = [];

    try {
      await connection
        .beginTransaction();

      /*
       * Serialises notification campaigns
       * for this tenant.
       */
      const lockedSubscription =
        await repo
          .lockActiveTenantSubscription({
            connection,
            tenantId:
              auth.tenantId,
          });

      if (!lockedSubscription) {
        throw httpError(
          403,
          "An active subscription is required"
        );
      }

      let used = 0;

      if (limit !== null) {
        used =
          await repo
            .countTenantPushDeliveries({
              connection,
              tenantId:
                auth.tenantId,
              periodStart,
              periodEnd,
            });

        const requested =
          recipients.length;

        if (
          used + requested >
          limit
        ) {
          const remaining =
            Math.max(
              limit - used,
              0
            );

          const error =
            httpError(
              403,
              `Push notification monthly limit exceeded. ${remaining} recipient deliveries remaining.`
            );

          error.code =
            "SUBSCRIPTION_LIMIT_EXCEEDED";

          error.feature =
            "push_notification_limit";

          error.limit =
            limit;

          error.used =
            used;

          error.remaining =
            remaining;

          error.requested =
            requested;

          error.currentPlan =
            subscription.plan_code;

          throw error;
        }
      }

      for (
        const recipient
        of recipients
      ) {
        const payload =
          buildNotification(
            recipient
          );

        const notificationId =
          await repo.create({
            connection,

            tenantId:
              auth.tenantId,

            userId:
              recipient.user_id,

            ...payload,
          });

        created.push({
          notificationId,
          userId:
            recipient.user_id,
        });
      }

      await connection.commit();
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }

      throw error;
    } finally {
      connection.release();
    }

    /*
     * Emit websocket events only AFTER
     * the transaction has committed.
     */
    for (
      const item
      of created
    ) {
      await repo
        .emitCreatedNotification({
          tenantId:
            auth.tenantId,

          userId:
            item.userId,

          notificationId:
            item.notificationId,
        });
    }

    return {
      sentCount:
        created.length,
    };
  };
/*
|--------------------------------------------------------------------------
| Browser push subscriptions
|--------------------------------------------------------------------------
*/

const savePushSubscription =
  async ({
    auth,
    body,
    userAgent = null,
  }) => {
    if (
      !auth?.tenantId ||
      !auth?.userId
    ) {
      throw httpError(
        401,
        "Authenticated tenant user is required"
      );
    }

    const endpoint =
      body?.endpoint;

    const p256dh =
      body?.keys?.p256dh;

    const authSecret =
      body?.keys?.auth;

    if (
      !endpoint ||
      !p256dh ||
      !authSecret
    ) {
      throw httpError(
        422,
        "Invalid push subscription"
      );
    }

    const subscription =
      await repo
        .upsertPushSubscription({
          tenantId:
            auth.tenantId,

          userId:
            auth.userId,

          endpoint,
          p256dh,
          authSecret,
          userAgent,
        });

    if (!subscription) {
      throw httpError(
        500,
        "Unable to save push subscription"
      );
    }

    return subscription;
  };
 const removePushSubscription =
  async ({
    auth,
    body,
  }) => {
    if (
      !auth?.tenantId ||
      !auth?.userId
    ) {
      throw httpError(
        401,
        "Authenticated tenant user is required"
      );
    }

    await repo
      .deactivatePushSubscription({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        endpoint:
          body.endpoint,
      });

    /*
     * Keep this idempotent.
     *
     * A browser may attempt to unregister
     * a subscription that has already
     * expired or been deactivated.
     */
    return {
      removed: true,
    };
  };

module.exports = {
  listMine,
  unreadCount,
  markRead,
  markAllRead,
  archive,
  broadcast,
  notifyUser,

  createTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,

  sendToClients,
  getPushNotificationQuota,
  getBillingPeriod,

  createTenantNotificationsWithQuota,
  savePushSubscription,
  replaceTemplateVariables,
  removePushSubscription,
  
};
