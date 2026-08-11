const { randomUUID } = require("crypto");
const db = require("../../config/db");

const create = async ({
  connection = db,
  tenantId = null,
  actorUserId = null,
  actorType = "user",
  action,
  entityType = null,
  entityId = null,
  requestMethod = null,
  requestPath = null,
  ipAddress = null,
  userAgent = null,
  status = "success",
  description = null,
  metadata = null,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO audit_logs (
        id,
        tenant_id,
        actor_user_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        request_method,
        request_path,
        ip_address,
        user_agent,
        status,
        description,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      actorUserId,
      actorType,
      action,
      entityType,
      entityId,
      requestMethod,
      requestPath,
      ipAddress,
      userAgent,
      status,
      description,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

  return id;
};

const findById = async ({
  tenantId,
  auditLogId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        al.*,
        u.full_name AS actor_name,
        u.email AS actor_email
      FROM audit_logs al
      LEFT JOIN users u
        ON u.id = al.actor_user_id
      WHERE al.id = ?
        AND (
          al.tenant_id = ?
          OR (
            al.tenant_id IS NULL
            AND ? IS NULL
          )
        )
      LIMIT 1
    `,
    [
      auditLogId,
      tenantId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const list = async ({
  tenantId,
  actorUserId,
  action,
  entityType,
  entityId,
  status,
  dateFrom,
  dateTo,
  limit,
  offset,
}) => {
  const conditions = [
    "al.tenant_id = ?",
  ];

  const values = [
    tenantId,
  ];

  if (actorUserId) {
    conditions.push(
      "al.actor_user_id = ?"
    );
    values.push(actorUserId);
  }

  if (action) {
    conditions.push(
      "al.action = ?"
    );
    values.push(action);
  }

  if (entityType) {
    conditions.push(
      "al.entity_type = ?"
    );
    values.push(entityType);
  }

  if (entityId) {
    conditions.push(
      "al.entity_id = ?"
    );
    values.push(entityId);
  }

  if (status) {
    conditions.push(
      "al.status = ?"
    );
    values.push(status);
  }

  if (dateFrom) {
    conditions.push(
      "al.created_at >= ?"
    );
    values.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(
      "al.created_at < ?"
    );
    values.push(dateTo);
  }

  const [rows] = await db.query(
    `
      SELECT
        al.*,
        u.full_name AS actor_name,
        u.email AS actor_email
      FROM audit_logs al
      LEFT JOIN users u
        ON u.id = al.actor_user_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY al.created_at DESC
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

const count = async ({
  tenantId,
  actorUserId,
  action,
  entityType,
  entityId,
  status,
  dateFrom,
  dateTo,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];

  const values = [
    tenantId,
  ];

  const filters = {
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    status,
  };

  for (
    const [column, value]
    of Object.entries(filters)
  ) {
    if (value) {
      conditions.push(
        `${column} = ?`
      );
      values.push(value);
    }
  }

  if (dateFrom) {
    conditions.push(
      "created_at >= ?"
    );
    values.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(
      "created_at < ?"
    );
    values.push(dateTo);
  }

  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM audit_logs
      WHERE ${conditions.join(" AND ")}
    `,
    values
  );

  return Number(
    rows[0]?.total || 0
  );
};

module.exports = {
  create,
  findById,
  list,
  count,
};
