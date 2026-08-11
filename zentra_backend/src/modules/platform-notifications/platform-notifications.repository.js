const { randomUUID } = require("crypto");
const db = require("../../config/db");

const listNotifications = async ({
  platformUserId,
  page,
  limit,
  severity,
  type,
  unreadOnly,
}) => {
  const offset = (page - 1) * limit;
  const conditions = [
    "r.platform_user_id = ?",
  ];
  const values = [platformUserId];

  if (severity) {
    conditions.push("n.severity = ?");
    values.push(severity);
  }

  if (type) {
    conditions.push("n.notification_type = ?");
    values.push(type);
  }

  if (unreadOnly) {
    conditions.push("r.is_read = FALSE");
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await db.query(
    `
      SELECT
        n.id,
        n.notification_type,
        n.severity,
        n.title,
        n.message,
        n.tenant_id,
        n.entity_type,
        n.entity_id,
        n.created_at,
        r.is_read,
        r.read_at
      FROM platform_notifications n
      INNER JOIN platform_notification_recipients r
        ON r.notification_id = n.id
      ${where}
      ORDER BY n.created_at DESC
      LIMIT ?
      OFFSET ?
    `,
    [...values, limit, offset]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM platform_notifications n
      INNER JOIN platform_notification_recipients r
        ON r.notification_id = n.id
      ${where}
    `,
    values
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const findNotificationById = async ({
  notificationId,
  platformUserId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        n.*,
        r.is_read,
        r.read_at
      FROM platform_notifications n
      INNER JOIN platform_notification_recipients r
        ON r.notification_id = n.id
      WHERE n.id = ?
        AND r.platform_user_id = ?
      LIMIT 1
    `,
    [notificationId, platformUserId]
  );

  return rows[0] || null;
};

const createNotification = async ({
  type,
  severity,
  title,
  message,
  tenantId,
  entityType,
  entityId,
  recipientUserIds,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const notificationId = randomUUID();

    await connection.query(
      `
        INSERT INTO platform_notifications (
          id,
          notification_type,
          severity,
          title,
          message,
          tenant_id,
          entity_type,
          entity_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        notificationId,
        type,
        severity,
        title,
        message,
        tenantId || null,
        entityType || null,
        entityId || null,
      ]
    );

    for (const platformUserId of recipientUserIds) {
      await connection.query(
        `
          INSERT INTO platform_notification_recipients (
            id,
            notification_id,
            platform_user_id
          ) VALUES (?, ?, ?)
        `,
        [
          randomUUID(),
          notificationId,
          platformUserId,
        ]
      );
    }

    await connection.commit();
    return notificationId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const markRead = async ({
  notificationId,
  platformUserId,
}) => {
  await db.query(
    `
      UPDATE platform_notification_recipients
      SET
        is_read = TRUE,
        read_at = NOW()
      WHERE notification_id = ?
        AND platform_user_id = ?
    `,
    [notificationId, platformUserId]
  );

  return findNotificationById({
    notificationId,
    platformUserId,
  });
};

const markAllRead = async (platformUserId) => {
  await db.query(
    `
      UPDATE platform_notification_recipients
      SET
        is_read = TRUE,
        read_at = NOW()
      WHERE platform_user_id = ?
        AND is_read = FALSE
    `,
    [platformUserId]
  );
};

const countUnread = async (platformUserId) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM platform_notification_recipients
      WHERE platform_user_id = ?
        AND is_read = FALSE
    `,
    [platformUserId]
  );

  return Number(rows[0]?.total || 0);
};

module.exports = {
  listNotifications,
  findNotificationById,
  createNotification,
  markRead,
  markAllRead,
  countUnread,
};
