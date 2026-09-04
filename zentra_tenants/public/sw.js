self.addEventListener(
  "push",
  (event) => {
    let payload = {};

    try {
      payload =
        event.data
          ? event.data.json()
          : {};
    } catch {
      payload = {
        title: "ZentraBank",
        body:
          event.data?.text() ||
          "You have a new notification.",
      };
    }

    const title =
      payload.title ||
      "ZentraBank";

    const options = {
      body:
        payload.body ||
        "You have a new notification.",

      data: {
        ...(payload.data || {}),

        actionUrl:
          payload.data?.actionUrl ||
          "/notifications",
      },

      tag:
        payload.data?.notificationId ||
        undefined,

      renotify:
        Boolean(
          payload.data?.notificationId
        ),
    };

    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options
        )
    );
  }
);


/*
|--------------------------------------------------------------------------
| Notification click
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const actionUrl =
      event.notification
        .data?.actionUrl ||
      "/notifications";

    /*
     * Only allow internal application paths.
     */
    const safePath =
      typeof actionUrl === "string" &&
      actionUrl.startsWith("/") &&
      !actionUrl.startsWith("//")
        ? actionUrl
        : "/notifications";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          async (
            clientList
          ) => {
            /*
             * If ZentraBank is already open,
             * focus the existing window.
             */
            for (
              const client
              of clientList
            ) {
              if (
                "focus" in client
              ) {
                await client.focus();

                if (
                  "navigate" in client
                ) {
                  await client.navigate(
                    safePath
                  );
                }

                return;
              }
            }

            /*
             * Otherwise open ZentraBank.
             */
            if (
              clients.openWindow
            ) {
              return clients.openWindow(
                safePath
              );
            }

            return undefined;
          }
        )
    );
  }
);