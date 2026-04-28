const db = require("../../config/db");

async function createLog({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}) {
  await db.query(
    `INSERT INTO audit_logs
     (tenant_id, user_id, action, entity_type, entity_id, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      tenantId,
      userId,
      action,
      entityType || null,
      entityId || null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

async function getLogs({
  tenantId,
  limit = 20,
  offset = 0,
  action,
  entityType,
}) {
  let sql = `
    SELECT *
    FROM audit_logs
    WHERE tenant_id = ?
  `;

  const params = [tenantId];

  if (action) {
    sql += ` AND action = ?`;
    params.push(action);
  }

  if (entityType) {
    sql += ` AND entity_type = ?`;
    params.push(entityType);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, params);

  return rows;
}

module.exports = {
  createLog,
  getLogs,
};