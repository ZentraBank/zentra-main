const { randomUUID } = require("crypto");
const db = require("../../config/db");

const {
  emitToUser,
} = require("../../realtime/socket");

const create = async ({
  connection = db,
  tenantId,
  userId,
  notificationType,
  title,
  message,
  entityType = null,
  entityId = null,
  priority = "normal",
  actionUrl = null,
  metadata = null,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO notifications (
        id,
        tenant_id,
        user_id,
        notification_type,
        title,
        message,
        entity_type,
        entity_id,
        priority,
        action_url,
        metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      notificationType,
      title,
      message,
      entityType,
      entityId,
      priority,
      actionUrl,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ],
  );

  const [rows] =
    await connection.query(
      `
        SELECT *
        FROM notifications
        WHERE id = ?
          AND tenant_id = ?
        LIMIT 1
      `,
      [
        id,
        tenantId,
      ],
    );

  const notification =
    rows[0] || null;

  if (
    notification &&
    connection === db
  ) {
    emitToUser(
      userId,
      "notification:new",
      notification,
    );
  }

  return id;
};

const listByUser = async ({
  tenantId,userId,unreadOnly,includeArchived,limit,offset
}) => {
  const where = ["tenant_id=?","user_id=?"];
  const values = [tenantId,userId];
  if (unreadOnly) where.push("is_read=FALSE");
  if (!includeArchived) where.push("is_archived=FALSE");
  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE ${where.join(" AND ")}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values,limit,offset]
  );
  return rows;
};

const findById = async ({ tenantId, notificationId }) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE id=? AND tenant_id=? LIMIT 1`,
    [notificationId,tenantId]
  );
  return rows[0] || null;
};

const countUnread = async ({ tenantId,userId }) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) total FROM notifications
     WHERE tenant_id=? AND user_id=? AND is_read=FALSE AND is_archived=FALSE`,
    [tenantId,userId]
  );
  return Number(rows[0]?.total || 0);
};

const markRead = ({ tenantId,userId,notificationId }) =>
  db.query(
    `UPDATE notifications SET is_read=TRUE,read_at=COALESCE(read_at,NOW())
     WHERE id=? AND tenant_id=? AND user_id=?`,
    [notificationId,tenantId,userId]
  );

const markAllRead = ({ tenantId,userId }) =>
  db.query(
    `UPDATE notifications SET is_read=TRUE,read_at=COALESCE(read_at,NOW())
     WHERE tenant_id=? AND user_id=? AND is_read=FALSE AND is_archived=FALSE`,
    [tenantId,userId]
  );

const archive = ({ tenantId,userId,notificationId }) =>
  db.query(
    `UPDATE notifications SET is_archived=TRUE,
     archived_at=COALESCE(archived_at,NOW())
     WHERE id=? AND tenant_id=? AND user_id=?`,
    [notificationId,tenantId,userId]
  );

const audienceUsers = async ({ tenantId,audienceType,audienceValue }) => {
  let sql;
  let params;
  if (audienceType === "all_users") {
    sql = `SELECT DISTINCT user_id FROM tenant_memberships
           WHERE tenant_id=? AND status='active'`;
    params = [tenantId];
  } else if (audienceType === "role") {
  sql = `
    SELECT DISTINCT
      tm.user_id
    FROM tenant_memberships tm
    INNER JOIN roles r
      ON r.id = tm.role_id
    WHERE tm.tenant_id = ?
      AND tm.status = 'active'
      AND r.code = ?
      AND r.is_active = 1
  `;

  params = [
    tenantId,
    audienceValue,
  ];
} else {
    sql = `SELECT DISTINCT us.user_id FROM user_subscriptions us
           JOIN subscription_plans sp ON sp.id=us.plan_id
           WHERE us.tenant_id=? AND us.status='active'
             AND (us.expires_at IS NULL OR us.expires_at>NOW())
             AND sp.code=?`;
    params = [tenantId,audienceValue];
  }
  const [rows] = await db.query(sql,params);
  return rows;
};

module.exports = {
  db,create,listByUser,findById,countUnread,markRead,
  markAllRead,archive,audienceUsers
};
