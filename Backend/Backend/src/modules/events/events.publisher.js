const {
  getQueue,
} = require("../../config/queue");

const repo =
  require("./events.repository");

const {
  createDeliveriesForEvent,
} = require("../webhooks/webhooks.service");

const EVENT_QUEUE =
  "zentrabank-events";

const publishEvent = async (
  event
) => {
  try {
    await createDeliveriesForEvent(
      event
    );

    const queue =
      getQueue(EVENT_QUEUE);

    await queue.add(
      "dispatch-webhook-event",
      {
        eventId: event.id,
        tenantId:
          event.tenant_id,
      },
      {
        jobId:
          `event:${event.id}`,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      }
    );

    await repo.markPublished({
      eventId:
        event.id,
    });
  } catch (error) {
    await repo.markFailed({
      eventId:
        event.id,
    });

    throw error;
  }
};

module.exports = {
  publishEvent,
  EVENT_QUEUE,
};
