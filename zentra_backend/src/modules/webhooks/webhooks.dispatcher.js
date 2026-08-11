const {
  Worker,
} = require("bullmq");

const {
  connection,
} = require("../../config/queue");

const {
  decryptSecret,
  signPayload,
} = require("./webhooks.crypto");

const repo =
  require("./webhooks.repository");

const {
  EVENT_QUEUE,
} = require("../events/events.publisher");

const calculateNextAttempt = (
  attempt
) => {
  const delaySeconds =
    Math.min(
      3600,
      15 *
      Math.pow(
        2,
        Math.max(
          0,
          attempt - 1
        )
      )
    );

  return new Date(
    Date.now() +
    delaySeconds * 1000
  );
};

const sendDelivery = async (
  delivery
) => {
  const startedAt =
    Date.now();

  await repo
    .markDeliveryProcessing({
      deliveryId:
        delivery.id,
    });

  const attemptNumber =
    Number(
      delivery.attempt_count
    ) + 1;

  const body =
    typeof delivery
      .request_body ===
      "string"
      ? delivery.request_body
      : JSON.stringify(
          delivery.request_body
        );

  const timestamp =
    Math.floor(
      Date.now() / 1000
    ).toString();

  const secret =
    decryptSecret(
      delivery.secret_encrypted
    );

  const signature =
    signPayload({
      secret,
      timestamp,
      rawBody: body,
    });

  const headers = {
    "content-type":
      "application/json",
    "user-agent":
      "ZentraBank-Webhooks/1.0",
    "x-zentrabank-event-id":
      delivery.domain_event_id,
    "x-zentrabank-delivery-id":
      delivery.id,
    "x-zentrabank-timestamp":
      timestamp,
    "x-zentrabank-signature":
      `v1=${signature}`,
  };

  let response;
  let responseBody = null;
  let error = null;

  try {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        Number(
          delivery.timeout_ms ||
          10000
        )
      );

    try {
      response =
        await fetch(
          delivery.endpoint_url,
          {
            method: "POST",
            headers,
            body,
            signal:
              controller.signal,
          }
        );

      responseBody =
        await response.text();
    } finally {
      clearTimeout(
        timeout
      );
    }

    if (
      response.status >= 200 &&
      response.status < 300
    ) {
      await repo
        .completeDelivery({
          deliveryId:
            delivery.id,
          requestHeaders:
            headers,
          responseStatus:
            response.status,
          responseHeaders:
            Object.fromEntries(
              response.headers.entries()
            ),
          responseBody,
        });
    } else {
      error =
        new Error(
          `Webhook returned HTTP ${response.status}`
        );
    }
  } catch (caught) {
    error = caught;
  }

  await repo.createAttempt({
    tenantId:
      delivery.tenant_id,
    deliveryId:
      delivery.id,
    attemptNumber,
    requestHeaders:
      headers,
    requestBody:
      JSON.parse(body),
    responseStatus:
      response?.status ||
      null,
    responseHeaders:
      response
        ? Object.fromEntries(
            response.headers.entries()
          )
        : null,
    responseBody,
    error,
    durationMs:
      Date.now() -
      startedAt,
  });

  if (error) {
    const deadLetter =
      attemptNumber >=
      Number(
        delivery.max_attempts
      );

    await repo.failDelivery({
      deliveryId:
        delivery.id,
      requestHeaders:
        headers,
      error,
      responseStatus:
        response?.status ||
        null,
      responseHeaders:
        response
          ? Object.fromEntries(
              response.headers.entries()
            )
          : null,
      responseBody,
      deadLetter,
      nextAttemptAt:
        deadLetter
          ? null
          : calculateNextAttempt(
              attemptNumber
            ),
    });

    throw error;
  }
};

const worker =
  new Worker(
    EVENT_QUEUE,
    async (job) => {
      const {
        tenantId,
        eventId,
      } = job.data;

      const deliveries =
        await repo
          .findPendingDeliveries({
            tenantId,
            eventId,
            limit: 100,
          });

      for (
        const delivery
        of deliveries
      ) {
        await sendDelivery(
          delivery
        );
      }

      return {
        processed:
          deliveries.length,
      };
    },
    {
      connection,
      concurrency:
        Number(
          process.env
            .WEBHOOK_CONCURRENCY ||
          10
        ),
    }
  );

worker.on(
  "error",
  (error) => {
    console.error(
      "[webhooks] worker error",
      error
    );
  }
);

module.exports = {
  worker,
  sendDelivery,
};
