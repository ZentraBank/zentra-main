const { randomUUID } = require("crypto");
const db = require("../../config/db");
const {
  emitToUser,
} = require("../../realtime/socket");

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

const listActiveSubscriptionReviewers =
  async () => {
    const [rows] = await db.query(
      `
        SELECT DISTINCT
          pu.id

        FROM platform_users pu

        INNER JOIN platform_user_roles pur
          ON pur.platform_user_id = pu.id

        INNER JOIN platform_roles pr
          ON pr.id = pur.platform_role_id

        INNER JOIN platform_role_permissions prp
          ON prp.platform_role_id = pr.id

        INNER JOIN permissions p
          ON p.id = prp.permission_id

        WHERE pu.status = 'active'
          AND p.code = 'platform.subscriptions.update'
      `
    );

    return rows.map(
      (row) => row.id
    );
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
  const connection = await db.pool.getConnection();

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

const findActiveTenantStaff = async ({
  tenantIds,
  connection = db,
}) => {
  if (
    !Array.isArray(tenantIds) ||
    tenantIds.length === 0
  ) {
    return [];
  }

  const uniqueTenantIds = [
    ...new Set(tenantIds),
  ];

  const placeholders =
    uniqueTenantIds
      .map(() => "?")
      .join(", ");

  const [rows] =
    await connection.query(
      `
        SELECT DISTINCT
          tm.tenant_id,
          u.id AS user_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.email,
          r.code AS role_code

        FROM tenant_memberships tm

        INNER JOIN users u
          ON u.id = tm.user_id

        INNER JOIN roles r
          ON r.id = tm.role_id

        INNER JOIN tenants t
          ON t.id = tm.tenant_id

        WHERE tm.tenant_id IN (
          ${placeholders}
        )

          AND tm.status = 'active'
          AND u.status = 'active'
          AND u.deleted_at IS NULL
          AND t.status = 'active'
          AND r.is_active = TRUE

          /*
           * Platform notifications are for
           * tenant staff, not banking clients.
           */
          AND r.code NOT IN (
            'customer',
            'client'
          )

        ORDER BY
          tm.tenant_id,
          u.created_at ASC
      `,
      uniqueTenantIds
    );

  return rows;
};

const listActiveTenantIds = async ({
  connection = db,
} = {}) => {
  const [rows] =
    await connection.query(
      `
        SELECT id
        FROM tenants
        WHERE status = 'active'
        ORDER BY created_at ASC
      `
    );

  return rows.map(
    (row) => row.id
  );
};

const createTenantPlatformNotification =
  async ({
    connection = db,
    tenantId,
    userId,
    title,
    message,
    priority = "normal",
    actionUrl = null,
    entityType = null,
    entityId = null,
    metadata = null,
  }) => {
    const id =
      randomUUID();

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
        VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `,
      [
        id,
        tenantId,
        userId,
        "platform_notification",
        title,
        message,
        entityType,
        entityId,
        priority,
        actionUrl,
        metadata
          ? JSON.stringify(metadata)
          : null,
      ]
    );

    return id;
  };

  const findTenantPlatformNotificationById =
  async ({
    notificationId,
    tenantId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT *
          FROM notifications
          WHERE id = ?
            AND tenant_id = ?
            AND notification_type =
              'platform_notification'
          LIMIT 1
        `,
        [
          notificationId,
          tenantId,
        ]
      );

    return rows[0] || null;
  };

const emitTenantPlatformNotification =
  async ({
    tenantId,
    userId,
    notificationId,
  }) => {
    const notification =
      await findTenantPlatformNotificationById({
        notificationId,
        tenantId,
      });

    if (!notification) {
      return;
    }

    emitToUser(
      userId,
      "notification:new",
      notification
    );
  };

module.exports = {
  db,
  listNotifications,
  findNotificationById,
  createNotification,
  markRead,
  markAllRead,
  countUnread,
  listActiveSubscriptionReviewers,
  findActiveTenantStaff,
  listActiveTenantIds,
  createTenantPlatformNotification,
  findTenantPlatformNotificationById,
  emitTenantPlatformNotification,
};
