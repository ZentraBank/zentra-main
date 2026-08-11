const {
  randomUUID,
} = require("crypto");

const db =
  require("../../config/db");

const createEndpoint = async ({
  tenantId,
  body,
  encryptedSecret,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO webhook_endpoints (
        id,
        tenant_id,
        name,
        endpoint_url,
        secret_encrypted,
        subscribed_events,
        status,
        timeout_ms,
        max_attempts,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.name,
      body.endpointUrl,
      encryptedSecret,
      JSON.stringify(
        body.subscribedEvents
      ),
      body.status,
      body.timeoutMs,
      body.maxAttempts,
      createdBy,
    ]
  );

  return findEndpointById({
    tenantId,
    endpointId: id,
  });
};

const findEndpointById = async ({
  tenantId,
  endpointId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM webhook_endpoints
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, endpointId]
  );

  return rows[0] || null;
};

const listEndpoints = async ({
  tenantId,
  status,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];
  const values = [tenantId];

  if (status) {
    conditions.push(
      "status = ?"
    );
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT
        id,
        tenant_id,
        name,
        endpoint_url,
        subscribed_events,
        status,
        timeout_ms,
        max_attempts,
        created_at,
        updated_at
      FROM webhook_endpoints
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `,
    values
  );

  return rows;
};

const updateEndpoint = async ({
  tenantId,
  endpointId,
  body,
  encryptedSecret,
  updatedBy,
}) => {
  await db.query(
    `
      UPDATE webhook_endpoints
      SET
        name = COALESCE(?, name),
        endpoint_url = COALESCE(?, endpoint_url),
        secret_encrypted = COALESCE(?, secret_encrypted),
        subscribed_events = COALESCE(?, subscribed_events),
        status = COALESCE(?, status),
        timeout_ms = COALESCE(?, timeout_ms),
        max_attempts = COALESCE(?, max_attempts),
        updated_by = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.name ?? null,
      body.endpointUrl ?? null,
      encryptedSecret || null,
      body.subscribedEvents
        ? JSON.stringify(
            body.subscribedEvents
          )
        : null,
      body.status ?? null,
      body.timeoutMs ?? null,
      body.maxAttempts ?? null,
      updatedBy,
      tenantId,
      endpointId,
    ]
  );

  return findEndpointById({
    tenantId,
    endpointId,
  });
};

const findSubscribers = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM webhook_endpoints
      WHERE tenant_id = ?
        AND status = 'active'
    `,
    [tenantId]
  );

  return rows;
};

const createDelivery = async ({
  tenantId,
  endpointId,
  eventId,
  deliveryKey,
  requestBody,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT IGNORE INTO webhook_deliveries (
        id,
        tenant_id,
        webhook_endpoint_id,
        domain_event_id,
        delivery_key,
        request_body,
        next_attempt_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      id,
      tenantId,
      endpointId,
      eventId,
      deliveryKey,
      JSON.stringify(
        requestBody
      ),
    ]
  );
};

const findPendingDeliveries = async ({
  tenantId,
  eventId,
  limit,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        d.*,
        e.endpoint_url,
        e.secret_encrypted,
        e.timeout_ms,
        e.max_attempts
      FROM webhook_deliveries d
      INNER JOIN webhook_endpoints e
        ON e.id =
          d.webhook_endpoint_id
      WHERE d.tenant_id = ?
        AND d.domain_event_id = ?
        AND d.status IN (
          'pending',
          'failed'
        )
        AND (
          d.next_attempt_at IS NULL
          OR d.next_attempt_at <= NOW()
        )
        AND e.status = 'active'
      ORDER BY d.created_at ASC
      LIMIT ?
    `,
    [
      tenantId,
      eventId,
      limit,
    ]
  );

  return rows;
};

const markDeliveryProcessing = ({
  deliveryId,
}) =>
  db.query(
    `
      UPDATE webhook_deliveries
      SET
        status = 'processing',
        attempt_count =
          attempt_count + 1
      WHERE id = ?
    `,
    [deliveryId]
  );

const completeDelivery = ({
  deliveryId,
  requestHeaders,
  responseStatus,
  responseHeaders,
  responseBody,
}) =>
  db.query(
    `
      UPDATE webhook_deliveries
      SET
        status = 'delivered',
        request_headers = ?,
        response_status = ?,
        response_headers = ?,
        response_body = ?,
        delivered_at = NOW(),
        last_error = NULL,
        next_attempt_at = NULL
      WHERE id = ?
    `,
    [
      JSON.stringify(
        requestHeaders
      ),
      responseStatus,
      responseHeaders
        ? JSON.stringify(
            responseHeaders
          )
        : null,
      responseBody || null,
      deliveryId,
    ]
  );

const failDelivery = ({
  deliveryId,
  requestHeaders,
  error,
  responseStatus,
  responseHeaders,
  responseBody,
  deadLetter,
  nextAttemptAt,
}) =>
  db.query(
    `
      UPDATE webhook_deliveries
      SET
        status = ?,
        request_headers = ?,
        response_status = ?,
        response_headers = ?,
        response_body = ?,
        last_error = ?,
        next_attempt_at = ?
      WHERE id = ?
    `,
    [
      deadLetter
        ? "dead_letter"
        : "failed",
      JSON.stringify(
        requestHeaders
      ),
      responseStatus || null,
      responseHeaders
        ? JSON.stringify(
            responseHeaders
          )
        : null,
      responseBody || null,
      error.message,
      nextAttemptAt || null,
      deliveryId,
    ]
  );

const createAttempt = ({
  tenantId,
  deliveryId,
  attemptNumber,
  requestHeaders,
  requestBody,
  responseStatus,
  responseHeaders,
  responseBody,
  error,
  durationMs,
}) =>
  db.query(
    `
      INSERT INTO webhook_delivery_attempts (
        id,
        tenant_id,
        webhook_delivery_id,
        attempt_number,
        request_headers,
        request_body,
        response_status,
        response_headers,
        response_body,
        error_message,
        duration_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      deliveryId,
      attemptNumber,
      requestHeaders
        ? JSON.stringify(
            requestHeaders
          )
        : null,
      requestBody
        ? JSON.stringify(
            requestBody
          )
        : null,
      responseStatus || null,
      responseHeaders
        ? JSON.stringify(
            responseHeaders
          )
        : null,
      responseBody || null,
      error
        ? error.message
        : null,
      durationMs,
    ]
  );

const listDeliveries = async ({
  tenantId,
  endpointId,
  status,
  limit,
  offset,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];
  const values = [tenantId];

  if (endpointId) {
    conditions.push(
      "webhook_endpoint_id = ?"
    );
    values.push(endpointId);
  }

  if (status) {
    conditions.push(
      "status = ?"
    );
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM webhook_deliveries
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
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

const resetDeliveryForReplay = ({
  tenantId,
  deliveryId,
}) =>
  db.query(
    `
      UPDATE webhook_deliveries
      SET
        status = 'pending',
        next_attempt_at = NOW(),
        last_error = NULL
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      tenantId,
      deliveryId,
    ]
  );

module.exports = {
  createEndpoint,
  findEndpointById,
  listEndpoints,
  updateEndpoint,
  findSubscribers,
  createDelivery,
  findPendingDeliveries,
  markDeliveryProcessing,
  completeDelivery,
  failDelivery,
  createAttempt,
  listDeliveries,
  resetDeliveryForReplay,
};
