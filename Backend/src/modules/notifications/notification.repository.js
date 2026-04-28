const db = require("../../config/db");

async function createNotification({
  tenantId,
  userId,
  title,
  message,
  type = "info",
  metadata,
}) {
  const [result] = await db.query(
    `INSERT INTO notifications
     (tenant_id, user_id, title, message, type, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      tenantId,
      userId,
      title,
      message,
      type,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );

  return result.insertId;
}

async function getUserNotifications({
  tenantId,
  userId,
  limit = 20,
  offset = 0,
  isRead,
  type,
}) {
  let sql = `
    SELECT *
    FROM notifications
    WHERE tenant_id = ? AND user_id = ?
  `;

  const params = [tenantId, userId];

  if (isRead !== undefined) {
    sql += ` AND is_read = ?`;
    params.push(isRead === "true" || isRead === true);
  }

  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, params);

  return rows;
}

async function getUnreadCount({ tenantId, userId }) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS unread_count
     FROM notifications
     WHERE tenant_id = ? AND user_id = ? AND is_read = FALSE`,
    [tenantId, userId]
  );

  return rows[0].unread_count;
}

async function markAsRead({ tenantId, userId, notificationId }) {
  const [result] = await db.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = ? AND tenant_id = ? AND user_id = ?`,
    [notificationId, tenantId, userId]
  );

  return result.affectedRows > 0;
}

async function markAllAsRead({ tenantId, userId }) {
  const [result] = await db.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE tenant_id = ? AND user_id = ? AND is_read = FALSE`,
    [tenantId, userId]
  );

  return result.affectedRows;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};