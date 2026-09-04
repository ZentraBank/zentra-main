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


  const createTemplate =
    async ({
      tenantId,
      createdBy,
      body,
    }) => {
      const id =
        randomUUID();

      await db.query(
        `
          INSERT INTO notification_templates (
            id,
            tenant_id,
            name,
            category,
            title,
            message,
            priority,
            action_url,
            status,
            created_by
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `,
        [
          id,
          tenantId,
          body.name,
          body.category || null,
          body.title,
          body.message,
          body.priority || "normal",
          body.actionUrl || null,
          body.status || "active",
          createdBy,
        ]
      );

      return findTemplateById({
        tenantId,
        templateId: id,
      });
    };

  const findTemplateById =
    async ({
      tenantId,
      templateId,
    }) => {
      const [rows] =
        await db.query(
          `
            SELECT *
            FROM notification_templates
            WHERE id = ?
              AND tenant_id = ?
            LIMIT 1
          `,
          [
            templateId,
            tenantId,
          ]
        );

      return rows[0] || null;
    };

  const listTemplates =
    async ({
      tenantId,
      status,
    }) => {
      const conditions = [
        "tenant_id = ?",
      ];

      const values = [
        tenantId,
      ];

      if (
        status &&
        status !== "all"
      ) {
        conditions.push(
          "status = ?"
        );

        values.push(
          status
        );
      }

      const [rows] =
        await db.query(
          `
            SELECT *
            FROM notification_templates
            WHERE ${conditions.join(" AND ")}
            ORDER BY created_at DESC
          `,
          values
        );

      return rows;
    };

  const updateTemplate =
    async ({
      tenantId,
      templateId,
      body,
    }) => {
      await db.query(
        `
          UPDATE notification_templates
          SET
            name = COALESCE(?, name),
            category = COALESCE(?, category),
            title = COALESCE(?, title),
            message = COALESCE(?, message),
            priority = COALESCE(?, priority),
            action_url = COALESCE(?, action_url),
            status = COALESCE(?, status)
          WHERE id = ?
            AND tenant_id = ?
        `,
        [
          body.name,
          body.category,
          body.title,
          body.message,
          body.priority,
          body.actionUrl,
          body.status,
          templateId,
          tenantId,
        ]
      );

      return findTemplateById({
        tenantId,
        templateId,
      });
    };

  const deleteTemplate =
    async ({
      tenantId,
      templateId,
    }) => {
      const [result] =
        await db.query(
          `
            DELETE FROM notification_templates
            WHERE id = ?
              AND tenant_id = ?
          `,
          [
            templateId,
            tenantId,
          ]
        );

      return (
        result.affectedRows === 1
      );
    };
    const findTenantClientById =
    async ({
      tenantId,
      userId,
    }) => {
      const [rows] =
        await db.query(
          `
            SELECT
              u.id AS user_id,
              u.first_name,
              u.middle_name,
              u.last_name,
              u.email

            FROM tenant_memberships tm

            INNER JOIN users u
              ON u.id = tm.user_id

            INNER JOIN roles r
              ON r.id = tm.role_id

            WHERE tm.tenant_id = ?
              AND tm.user_id = ?
              AND tm.status = 'active'
              AND u.status = 'active'

            LIMIT 1
          `,
          [
            tenantId,
            userId,
          ]
        );

      return rows[0] || null;
    };
    const findTenantClientsByIds =
    async ({
      tenantId,
      userIds,
    }) => {
      if (
        !Array.isArray(userIds) ||
        userIds.length === 0
      ) {
        return [];
      }

      const placeholders =
        userIds
          .map(() => "?")
          .join(", ");

      const [rows] =
        await db.query(
          `
            SELECT DISTINCT
              u.id AS user_id,
              u.first_name,
              u.middle_name,
              u.last_name,
              u.email

            FROM tenant_memberships tm

            INNER JOIN users u
              ON u.id = tm.user_id

            WHERE tm.tenant_id = ?
              AND tm.user_id IN (
                ${placeholders}
              )
              AND tm.status = 'active'
              AND u.status = 'active'
          `,
          [
            tenantId,
            ...userIds,
          ]
        );

      return rows;
    };
    const findAllTenantClients =
    async ({
      tenantId,
    }) => {
      const [rows] =
        await db.query(
          `
            SELECT DISTINCT
              u.id AS user_id,
              u.first_name,
              u.middle_name,
              u.last_name,
              u.email

            FROM tenant_memberships tm

            INNER JOIN users u
              ON u.id = tm.user_id

            WHERE tm.tenant_id = ?
              AND tm.status = 'active'
              AND u.status = 'active'
          `,
          [
            tenantId,
          ]
        );

      return rows;
    };

    const lockActiveTenantSubscription =
    async ({
      connection,
      tenantId,
    }) => {
      const [rows] =
        await connection.query(
          `
            SELECT
              us.id,
              us.tenant_id,
              us.user_id,
              us.plan_id,
              us.status,
              us.starts_at,
              us.expires_at,
              us.created_at,
              sp.code AS plan_code,
              sp.name AS plan_name
            FROM user_subscriptions us

            INNER JOIN subscription_plans sp
              ON sp.id = us.plan_id

            WHERE us.tenant_id = ?
              AND us.status = 'active'
              AND sp.is_active = TRUE
              AND (
                us.expires_at IS NULL
                OR us.expires_at > NOW()
              )

            ORDER BY
              us.starts_at DESC,
              us.created_at DESC

            LIMIT 1

            FOR UPDATE
          `,
          [
            tenantId,
          ]
        );

      return rows[0] || null;
    };


  const countTenantPushDeliveries =
    async ({
      connection = db,
      tenantId,
      periodStart,
      periodEnd,
    }) => {
      const [rows] =
        await connection.query(
          `
            SELECT
              COUNT(*) AS total
            FROM notifications
            WHERE tenant_id = ?
              AND notification_type IN (
                'tenant_notification',
                'admin_broadcast'
              )
              AND created_at >= ?
              AND created_at < ?
          `,
          [
            tenantId,
            periodStart,
            periodEnd,
          ]
        );

      return Number(
        rows[0]?.total || 0
      );
    };


  const findByIdWithConnection =
    async ({
      connection = db,
      tenantId,
      notificationId,
    }) => {
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
            notificationId,
            tenantId,
          ]
        );

      return rows[0] || null;
    };


  const emitCreatedNotification =
    async ({
      tenantId,
      userId,
      notificationId,
    }) => {
      const notification =
        await findByIdWithConnection({
          connection: db,
          tenantId,
          notificationId,
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

  /*
|--------------------------------------------------------------------------
| Push subscriptions
|--------------------------------------------------------------------------
*/

const upsertPushSubscription =
  async ({
    tenantId,
    userId,
    endpoint,
    p256dh,
    authSecret,
    userAgent = null,
  }) => {
    /*
     * A push endpoint identifies a browser
     * subscription.
     *
     * If the browser subscribes again, update
     * ownership/keys instead of creating a
     * duplicate row.
     */
    const id = randomUUID();

    await db.query(
      `
        INSERT INTO push_subscriptions (
          id,
          tenant_id,
          user_id,
          endpoint,
          p256dh,
          auth_secret,
          user_agent,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)

        ON DUPLICATE KEY UPDATE
          tenant_id = VALUES(tenant_id),
          user_id = VALUES(user_id),
          p256dh = VALUES(p256dh),
          auth_secret = VALUES(auth_secret),
          user_agent = VALUES(user_agent),
          is_active = TRUE,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        id,
        tenantId,
        userId,
        endpoint,
        p256dh,
        authSecret,
        userAgent,
      ],
    );

    const [rows] =
      await db.query(
        `
          SELECT
            id,
            tenant_id,
            user_id,
            endpoint,
            user_agent,
            is_active,
            created_at,
            updated_at
          FROM push_subscriptions
          WHERE endpoint = ?
          LIMIT 1
        `,
        [endpoint],
      );

    return rows[0] || null;
  };


const listActivePushSubscriptions =
  async ({
    tenantId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            id,
            tenant_id,
            user_id,
            endpoint,
            p256dh,
            auth_secret,
            user_agent,
            created_at,
            updated_at
          FROM push_subscriptions
          WHERE tenant_id = ?
            AND user_id = ?
            AND is_active = TRUE
          ORDER BY created_at ASC
        `,
        [
          tenantId,
          userId,
        ],
      );

    return rows;
  };


const deactivatePushSubscription =
  async ({
    tenantId,
    userId,
    endpoint,
  }) => {
    const [result] =
      await db.query(
        `
          UPDATE push_subscriptions
          SET
            is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ?
            AND user_id = ?
            AND endpoint = ?
            AND is_active = TRUE
        `,
        [
          tenantId,
          userId,
          endpoint,
        ],
      );

    return result.affectedRows > 0;
  };


const deactivatePushSubscriptionById =
  async ({
    subscriptionId,
  }) => {
    const [result] =
      await db.query(
        `
          UPDATE push_subscriptions
          SET
            is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND is_active = TRUE
        `,
        [
          subscriptionId,
        ],
      );

    return result.affectedRows > 0;
  };

  module.exports = {
    db,create,listByUser,findById,countUnread,markRead,
    markAllRead,archive,audienceUsers,
    createTemplate,findTemplateById,listTemplates,updateTemplate,deleteTemplate,findTenantClientById,findTenantClientsByIds,findAllTenantClients,lockActiveTenantSubscription,countTenantPushDeliveries,findByIdWithConnection,emitCreatedNotification,upsertPushSubscription,listActivePushSubscriptions,deactivatePushSubscription,deactivatePushSubscriptionById
  };
