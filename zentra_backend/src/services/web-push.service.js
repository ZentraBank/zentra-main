const webPush =
  require("web-push");

const env =
  require("../config/env");

/*
|--------------------------------------------------------------------------
| VAPID configuration
|--------------------------------------------------------------------------
|
| Configure Web Push once when this module loads.
|
| The private key must never be exposed to any frontend application.
|
*/

webPush.setVapidDetails(
  env.webPush.subject,
  env.webPush.publicKey,
  env.webPush.privateKey
);


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const buildPushSubscription =
  (subscription) => ({
    endpoint:
      subscription.endpoint,

    keys: {
      p256dh:
        subscription.p256dh,

      auth:
        subscription.auth_secret,
    },
  });


const buildPayload =
  ({
    title,
    message,
    actionUrl = null,
    notificationId = null,
    notificationType = null,
    priority = "normal",
    metadata = null,
  }) =>
    JSON.stringify({
      title,

      body:
        message,

      data: {
        actionUrl:
          actionUrl || "/notifications",

        notificationId,

        notificationType,

        priority,

        metadata,
      },
    });


/*
|--------------------------------------------------------------------------
| Send to one browser subscription
|--------------------------------------------------------------------------
*/

const sendToSubscription =
  async ({
    subscription,
    payload,
  }) => {
    const pushSubscription =
      buildPushSubscription(
        subscription
      );

    try {
      await webPush.sendNotification(
        pushSubscription,
        payload
      );

      return {
        delivered: true,
        expired: false,
      };
    } catch (error) {
      /*
       * 404 and 410 mean the browser push
       * subscription no longer exists.
       *
       * The caller should deactivate it in
       * the database.
       */
      if (
        error?.statusCode === 404 ||
        error?.statusCode === 410
      ) {
        return {
          delivered: false,
          expired: true,
          statusCode:
            error.statusCode,
        };
      }

      /*
       * Push delivery must not crash the
       * notification creation workflow.
       *
       * Log unexpected delivery failures
       * and allow the caller to continue.
       */
      console.error(
        "[WEB_PUSH] Delivery failed:",
        {
          subscriptionId:
            subscription.id,

          statusCode:
            error?.statusCode,

          message:
            error?.message,
        }
      );

      return {
        delivered: false,
        expired: false,
        statusCode:
          error?.statusCode || null,
      };
    }
  };


/*
|--------------------------------------------------------------------------
| Send to all browser subscriptions for a user
|--------------------------------------------------------------------------
*/

const sendToUser =
  async ({
    subscriptions,
    notification,
    onExpired = null,
  }) => {
    if (
      !Array.isArray(subscriptions) ||
      subscriptions.length === 0
    ) {
      return {
        attempted: 0,
        delivered: 0,
        expired: 0,
        failed: 0,
      };
    }

    const payload =
      buildPayload({
        title:
          notification.title,

        message:
          notification.message,

        actionUrl:
          notification.action_url,

        notificationId:
          notification.id,

        notificationType:
          notification.notification_type,

        priority:
          notification.priority ||
          "normal",

        metadata:
          notification.metadata ||
          null,
      });

    const results =
      await Promise.allSettled(
        subscriptions.map(
          async (subscription) => {
            const result =
              await sendToSubscription({
                subscription,
                payload,
              });

            if (
              result.expired &&
              typeof onExpired ===
                "function"
            ) {
              await onExpired(
                subscription
              );
            }

            return result;
          }
        )
      );

    let delivered = 0;
    let expired = 0;
    let failed = 0;

    for (
      const result
      of results
    ) {
      if (
        result.status ===
        "rejected"
      ) {
        failed += 1;
        continue;
      }

      if (
        result.value.delivered
      ) {
        delivered += 1;
        continue;
      }

      if (
        result.value.expired
      ) {
        expired += 1;
        continue;
      }

      failed += 1;
    }

    return {
      attempted:
        subscriptions.length,

      delivered,
      expired,
      failed,
    };
  };


module.exports = {
  buildPayload,
  sendToSubscription,
  sendToUser,
};