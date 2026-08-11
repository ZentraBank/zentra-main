const repo =
  require("./webhooks.repository");

const {
  encryptSecret,
} = require("./webhooks.crypto");

const parseEvents = (
  value
) => {
  if (!value) return [];
  if (
    typeof value === "object"
  ) return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const createEndpoint = ({
  auth,
  body,
}) =>
  repo.createEndpoint({
    tenantId:
      auth.tenantId,
    body,
    encryptedSecret:
      encryptSecret(
        body.secret
      ),
    createdBy:
      auth.userId,
  });

const listEndpoints = ({
  auth,
  query,
}) =>
  repo.listEndpoints({
    tenantId:
      auth.tenantId,
    status:
      query.status || null,
  });

const updateEndpoint = ({
  auth,
  endpointId,
  body,
}) =>
  repo.updateEndpoint({
    tenantId:
      auth.tenantId,
    endpointId,
    body,
    encryptedSecret:
      body.secret
        ? encryptSecret(
            body.secret
          )
        : null,
    updatedBy:
      auth.userId,
  });

const createDeliveriesForEvent =
  async (event) => {
    if (!event.tenant_id) {
      return 0;
    }

    const subscribers =
      await repo.findSubscribers({
        tenantId:
          event.tenant_id,
      });

    let created = 0;

    for (
      const endpoint
      of subscribers
    ) {
      const subscribedEvents =
        parseEvents(
          endpoint
            .subscribed_events
        );

      const matches =
        subscribedEvents
          .includes("*") ||
        subscribedEvents
          .includes(
            event.event_type
          );

      if (!matches) {
        continue;
      }

      await repo.createDelivery({
        tenantId:
          event.tenant_id,
        endpointId:
          endpoint.id,
        eventId:
          event.id,
        deliveryKey:
          `${endpoint.id}:${event.id}`,
        requestBody: {
          id: event.id,
          type:
            event.event_type,
          version:
            event.event_version,
          occurredAt:
            event.occurred_at,
          aggregate: {
            type:
              event.aggregate_type,
            id:
              event.aggregate_id,
          },
          data:
            typeof event.payload ===
            "string"
              ? JSON.parse(
                  event.payload
                )
              : event.payload,
          metadata:
            typeof event.metadata ===
            "string"
              ? JSON.parse(
                  event.metadata
                )
              : event.metadata,
        },
      });

      created += 1;
    }

    return created;
  };

const listDeliveries = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listDeliveries({
    tenantId:
      auth.tenantId,
    endpointId:
      query.endpointId || null,
    status:
      query.status || null,
    limit,
    offset:
      (page - 1) *
      limit,
  });
};

const replayDelivery = async ({
  auth,
  deliveryId,
}) => {
  await repo.resetDeliveryForReplay({
    tenantId:
      auth.tenantId,
    deliveryId,
  });

  return {
    deliveryId,
    status: "pending",
  };
};

module.exports = {
  createEndpoint,
  listEndpoints,
  updateEndpoint,
  createDeliveriesForEvent,
  listDeliveries,
  replayDelivery,
};
