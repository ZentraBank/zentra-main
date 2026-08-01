const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createEvent = async ({
  connection = db,
  tenantId,
  eventType,
  aggregateType,
  aggregateId,
  eventVersion,
  idempotencyKey,
  payload,
  metadata,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO domain_events (
        id,
        tenant_id,
        event_type,
        aggregate_type,
        aggregate_id,
        event_version,
        idempotency_key,
        payload,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId || null,
      eventType,
      aggregateType || null,
      aggregateId || null,
      eventVersion || 1,
      idempotencyKey,
      JSON.stringify(payload),
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

  return id;
};

const findEventByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM domain_events
      WHERE idempotency_key = ?
        AND (
          tenant_id = ?
          OR (
            tenant_id IS NULL
            AND ? IS NULL
          )
        )
      LIMIT 1
    `,
    [
      idempotencyKey,
      tenantId || null,
      tenantId || null,
    ]
  );

  return rows[0] || null;
};

const findEventById = async ({
  tenantId,
  eventId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM domain_events
      WHERE id = ?
        AND (
          tenant_id = ?
          OR tenant_id IS NULL
        )
      LIMIT 1
    `,
    [eventId, tenantId]
  );

  return rows[0] || null;
};

const markPublished = ({
  eventId,
}) =>
  db.query(
    `
      UPDATE domain_events
      SET
        status = 'published',
        published_at = NOW()
      WHERE id = ?
    `,
    [eventId]
  );

const markFailed = ({
  eventId,
}) =>
  db.query(
    `
      UPDATE domain_events
      SET status = 'failed'
      WHERE id = ?
    `,
    [eventId]
  );

const listEvents = async ({
  tenantId,
  eventType,
  status,
  fromDate,
  toDate,
  limit,
  offset,
}) => {
  const conditions = [
    "(tenant_id = ? OR tenant_id IS NULL)",
  ];
  const values = [tenantId];

  if (eventType) {
    conditions.push("event_type = ?");
    values.push(eventType);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (fromDate) {
    conditions.push("occurred_at >= ?");
    values.push(fromDate);
  }

  if (toDate) {
    conditions.push("occurred_at <= ?");
    values.push(toDate);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM domain_events
      WHERE ${conditions.join(" AND ")}
      ORDER BY occurred_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

module.exports = {
  db,
  createEvent,
  findEventByIdempotency,
  findEventById,
  markPublished,
  markFailed,
  listEvents,
};
