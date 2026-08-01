const repo =
  require("./events.repository");

const {
  publishEvent,
} = require("./events.publisher");

const emit = async ({
  connection,
  tenantId,
  eventType,
  aggregateType,
  aggregateId,
  eventVersion = 1,
  idempotencyKey,
  payload,
  metadata,
  publishImmediately = true,
}) => {
  const existing =
    await repo.findEventByIdempotency({
      tenantId,
      idempotencyKey,
    });

  if (existing) {
    return {
      idempotent: true,
      event: existing,
    };
  }

  const eventId =
    await repo.createEvent({
      connection,
      tenantId,
      eventType,
      aggregateType,
      aggregateId,
      eventVersion,
      idempotencyKey,
      payload,
      metadata,
    });

  const event =
    await repo.findEventById({
      tenantId,
      eventId,
    });

  if (
    publishImmediately &&
    !connection
  ) {
    await publishEvent(event);
  }

  return {
    idempotent: false,
    event,
  };
};

const listEvents = ({
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

  return repo.listEvents({
    tenantId:
      auth.tenantId,

    eventType:
      query.eventType || null,

    status:
      query.status || null,

    fromDate:
      query.fromDate || null,

    toDate:
      query.toDate || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

module.exports = {
  emit,
  listEvents,
};
