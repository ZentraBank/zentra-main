const {
  randomUUID,
} = require("crypto");

const db =
  require("../../config/db");


/*
|--------------------------------------------------------------------------
| Conversation helpers
|--------------------------------------------------------------------------
*/

const findConversationById =
  async ({
    conversationId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            pc.id,
            pc.tenant_id,
            pc.status,
            pc.created_at,
            pc.updated_at

          FROM platform_chat_conversations pc

          WHERE pc.id = ?

          LIMIT 1
        `,
        [
          conversationId,
        ]
      );

    return rows[0] || null;
  };


const findConversationByTenant =
  async ({
    tenantId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            pc.id,
            pc.tenant_id,
            pc.status,
            pc.created_at,
            pc.updated_at

          FROM platform_chat_conversations pc

          WHERE pc.tenant_id = ?

          LIMIT 1
        `,
        [
          tenantId,
        ]
      );

    return rows[0] || null;
  };


const createConversation =
  async ({
    tenantId,
    connection = db,
  }) => {
    const id =
      randomUUID();

    await connection.query(
      `
        INSERT INTO platform_chat_conversations (
          id,
          tenant_id,
          status
        )
        VALUES (?, ?, 'open')
      `,
      [
        id,
        tenantId,
      ]
    );

    return findConversationById({
      conversationId:
        id,

      connection,
    });
  };


const updateConversationStatus =
  async ({
    conversationId,
    status,
    connection = db,
  }) => {
    const [result] =
      await connection.query(
        `
          UPDATE platform_chat_conversations

          SET
            status = ?,
            updated_at = NOW()

          WHERE id = ?
        `,
        [
          status,
          conversationId,
        ]
      );

    return (
      result.affectedRows === 1
    );
  };


const touchConversation =
  async ({
    conversationId,
    connection = db,
  }) => {
    await connection.query(
      `
        UPDATE platform_chat_conversations

        SET updated_at = NOW()

        WHERE id = ?
      `,
      [
        conversationId,
      ]
    );
  };


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

const createMessage =
  async ({
    conversationId,
    senderType,
    senderId,
    message,
    connection = db,
  }) => {
    const id =
      randomUUID();

    await connection.query(
      `
        INSERT INTO platform_chat_messages (
          id,
          conversation_id,
          sender_type,
          sender_id,
          message
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        conversationId,
        senderType,
        senderId,
        message,
      ]
    );

    await touchConversation({
      conversationId,
      connection,
    });

    return findMessageById({
      messageId:
        id,

      connection,
    });
  };


const findMessageById =
  async ({
    messageId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            pm.id,
            pm.conversation_id,
            pm.sender_type,
            pm.sender_id,
            pm.message,
            pm.created_at,

            CASE
              WHEN pm.sender_type = 'tenant_user'
              THEN CONCAT_WS(
                ' ',
                tu.first_name,
                tu.middle_name,
                tu.last_name
              )

              WHEN pm.sender_type = 'platform_user'
              THEN CONCAT_WS(
                ' ',
                pu.first_name,
                pu.last_name
              )

              ELSE NULL
            END AS sender_name

          FROM platform_chat_messages pm

          LEFT JOIN users tu
            ON pm.sender_type = 'tenant_user'
           AND tu.id = pm.sender_id

          LEFT JOIN platform_users pu
            ON pm.sender_type = 'platform_user'
           AND pu.id = pm.sender_id

          WHERE pm.id = ?

          LIMIT 1
        `,
        [
          messageId,
        ]
      );

    return rows[0] || null;
  };


const listMessages =
  async ({
    conversationId,
    limit = 50,
    offset = 0,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            pm.id,
            pm.conversation_id,
            pm.sender_type,
            pm.sender_id,
            pm.message,
            pm.created_at,

            CASE
              WHEN pm.sender_type = 'tenant_user'
              THEN CONCAT_WS(
                ' ',
                tu.first_name,
                tu.middle_name,
                tu.last_name
              )

              WHEN pm.sender_type = 'platform_user'
              THEN CONCAT_WS(
                ' ',
                pu.first_name,
                pu.last_name
              )

              ELSE NULL
            END AS sender_name

          FROM platform_chat_messages pm

          LEFT JOIN users tu
            ON pm.sender_type = 'tenant_user'
           AND tu.id = pm.sender_id

          LEFT JOIN platform_users pu
            ON pm.sender_type = 'platform_user'
           AND pu.id = pm.sender_id

          WHERE pm.conversation_id = ?

          ORDER BY
            pm.created_at DESC,
            pm.id DESC

          LIMIT ?
          OFFSET ?
        `,
        [
          conversationId,
          Number(limit),
          Number(offset),
        ]
      );

    return rows;
  };


const countMessages =
  async ({
    conversationId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS total

          FROM platform_chat_messages

          WHERE conversation_id = ?
        `,
        [
          conversationId,
        ]
      );

    return Number(
      rows[0]?.total || 0
    );
  };


/*
|--------------------------------------------------------------------------
| Read state
|--------------------------------------------------------------------------
*/

const findReadState =
  async ({
    conversationId,
    actorType,
    actorId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            conversation_id,
            actor_type,
            actor_id,
            last_read_at,
            created_at,
            updated_at

          FROM platform_chat_read_states

          WHERE conversation_id = ?
            AND actor_type = ?
            AND actor_id = ?

          LIMIT 1
        `,
        [
          conversationId,
          actorType,
          actorId,
        ]
      );

    return rows[0] || null;
  };


const markConversationRead =
  async ({
    conversationId,
    actorType,
    actorId,
    readAt = null,
    connection = db,
  }) => {
    const id =
      randomUUID();

    await connection.query(
      `
        INSERT INTO platform_chat_read_states (
          id,
          conversation_id,
          actor_type,
          actor_id,
          last_read_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          COALESCE(?, NOW())
        )

        ON DUPLICATE KEY UPDATE
          last_read_at =
            COALESCE(
              VALUES(last_read_at),
              NOW()
            ),

          updated_at =
            NOW()
      `,
      [
        id,
        conversationId,
        actorType,
        actorId,
        readAt,
      ]
    );

    return findReadState({
      conversationId,
      actorType,
      actorId,
      connection,
    });
  };


const countUnreadMessages =
  async ({
    conversationId,
    actorType,
    actorId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS total

          FROM platform_chat_messages pm

          LEFT JOIN platform_chat_read_states prs
            ON prs.conversation_id =
                 pm.conversation_id
           AND prs.actor_type = ?
           AND prs.actor_id = ?

          WHERE pm.conversation_id = ?

            /*
             * Messages sent by the current
             * side are never unread for that
             * same side.
             */
            AND pm.sender_type <> ?

            AND (
              prs.last_read_at IS NULL
              OR
              pm.created_at >
                prs.last_read_at
            )
        `,
        [
          actorType,
          actorId,
          conversationId,
          actorType,
        ]
      );

    return Number(
      rows[0]?.total || 0
    );
  };


/*
|--------------------------------------------------------------------------
| Platform inbox
|--------------------------------------------------------------------------
*/

const listPlatformConversations =
  async ({
    platformUserId,
    status = null,
    limit = 20,
    offset = 0,
    connection = db,
  }) => {
    const params = [
      platformUserId,
    ];

    let statusSql = "";

    if (status) {
      statusSql =
        "AND pc.status = ?";

      params.push(
        status
      );
    }

    params.push(
      Number(limit),
      Number(offset)
    );

    const [rows] =
      await connection.query(
        `
          SELECT
            pc.id,
            pc.tenant_id,
            pc.status,
            pc.created_at,
            pc.updated_at,

            t.name AS tenant_name,
            t.slug AS tenant_slug,

            (
              SELECT
                pm.message

              FROM platform_chat_messages pm

              WHERE pm.conversation_id =
                pc.id

              ORDER BY
                pm.created_at DESC,
                pm.id DESC

              LIMIT 1
            ) AS last_message,

            (
              SELECT
                pm.sender_type

              FROM platform_chat_messages pm

              WHERE pm.conversation_id =
                pc.id

              ORDER BY
                pm.created_at DESC,
                pm.id DESC

              LIMIT 1
            ) AS last_message_sender_type,

            (
              SELECT
                pm.created_at

              FROM platform_chat_messages pm

              WHERE pm.conversation_id =
                pc.id

              ORDER BY
                pm.created_at DESC,
                pm.id DESC

              LIMIT 1
            ) AS last_message_at,

            (
              SELECT
                COUNT(*)

              FROM platform_chat_messages um

              LEFT JOIN platform_chat_read_states urs
                ON urs.conversation_id =
                     pc.id
               AND urs.actor_type =
                     'platform_user'
               AND urs.actor_id = ?

              WHERE um.conversation_id =
                pc.id

                AND um.sender_type =
                  'tenant_user'

                AND (
                  urs.last_read_at IS NULL
                  OR
                  um.created_at >
                    urs.last_read_at
                )
            ) AS unread_count

          FROM platform_chat_conversations pc

          INNER JOIN tenants t
            ON t.id = pc.tenant_id

          WHERE 1 = 1

          ${statusSql}

          ORDER BY
            COALESCE(
              (
                SELECT
                  MAX(pm2.created_at)

                FROM platform_chat_messages pm2

                WHERE pm2.conversation_id =
                  pc.id
              ),
              pc.created_at
            ) DESC

          LIMIT ?
          OFFSET ?
        `,
        params
      );

    return rows.map(
      (row) => ({
        ...row,

        unread_count:
          Number(
            row.unread_count || 0
          ),
      })
    );
  };


const countPlatformConversations =
  async ({
    status = null,
    connection = db,
  }) => {
    const params = [];

    let statusSql = "";

    if (status) {
      statusSql =
        "WHERE pc.status = ?";

      params.push(
        status
      );
    }

    const [rows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS total

          FROM platform_chat_conversations pc

          ${statusSql}
        `,
        params
      );

    return Number(
      rows[0]?.total || 0
    );
  };


const countPlatformUnread =
  async ({
    platformUserId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS total

          FROM platform_chat_messages pm

          INNER JOIN platform_chat_conversations pc
            ON pc.id =
               pm.conversation_id

          LEFT JOIN platform_chat_read_states prs
            ON prs.conversation_id =
                 pm.conversation_id
           AND prs.actor_type =
                 'platform_user'
           AND prs.actor_id = ?

          WHERE pm.sender_type =
            'tenant_user'

            AND (
              prs.last_read_at IS NULL
              OR
              pm.created_at >
                prs.last_read_at
            )
        `,
        [
          platformUserId,
        ]
      );

    return Number(
      rows[0]?.total || 0
    );
  };


/*
|--------------------------------------------------------------------------
| Actor validation
|--------------------------------------------------------------------------
*/

const findActiveTenantUser =
  async ({
    tenantId,
    userId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,

            tm.tenant_id,
            tm.status AS membership_status,

            r.code AS role_code

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id =
               tm.user_id

          INNER JOIN roles r
            ON r.id =
               tm.role_id

          WHERE tm.tenant_id = ?
            AND tm.user_id = ?
            AND tm.status = 'active'
            AND u.status = 'active'
            AND u.deleted_at IS NULL

          LIMIT 1
        `,
        [
          tenantId,
          userId,
        ]
      );

    return rows[0] || null;
  };


const findActivePlatformUser =
  async ({
    platformUserId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            first_name,
            last_name,
            email,
            role_code,
            status

          FROM platform_users

          WHERE id = ?
            AND status = 'active'

          LIMIT 1
        `,
        [
          platformUserId,
        ]
      );

    return rows[0] || null;
  };


module.exports = {
  findConversationById,
  findConversationByTenant,
  createConversation,
  updateConversationStatus,
  touchConversation,

  createMessage,
  findMessageById,
  listMessages,
  countMessages,

  findReadState,
  markConversationRead,
  countUnreadMessages,

  listPlatformConversations,
  countPlatformConversations,
  countPlatformUnread,

  findActiveTenantUser,
  findActivePlatformUser,
};