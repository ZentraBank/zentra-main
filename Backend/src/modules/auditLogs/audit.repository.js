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

async function getLogs({ tenantId, limit = 50, offset = 0 }) {
  const [rows] = await db.query(
    `SELECT *
     FROM audit_logs
     WHERE tenant_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [tenantId, Number(limit), Number(offset)]
  );

  return rows;
}

module.exports = {
  createLog,
  getLogs,
};