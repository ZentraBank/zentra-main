const {
  randomUUID,
} = require("crypto");

const db =
  require("../../config/db");

/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

const findConversationById =
  async ({
    tenantId,
    conversationId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            c.*,

            u.first_name
              AS client_first_name,

            u.middle_name
              AS client_middle_name,

            u.last_name
              AS client_last_name,

            u.email
              AS client_email

          FROM conversations c

          INNER JOIN users u
            ON u.id =
              c.client_user_id

          WHERE c.id = ?
            AND c.tenant_id = ?

          LIMIT 1
        `,
        [
          conversationId,
          tenantId,
        ]
      );

    return rows[0] || null;
  };

const findConversationByClient =
  async ({
    tenantId,
    clientUserId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT *
          FROM conversations

          WHERE tenant_id = ?
            AND client_user_id = ?

          LIMIT 1
        `,
        [
          tenantId,
          clientUserId,
        ]
      );

    return rows[0] || null;
  };

const createConversation =
  async ({
    tenantId,
    clientUserId,
  }) => {
    const existing =
      await findConversationByClient({
        tenantId,
        clientUserId,
      });

    if (existing) {
      return existing;
    }

    const id =
      randomUUID();

    await db.query(
      `
        INSERT INTO conversations (
          id,
          tenant_id,
          client_user_id,
          status
        )
        VALUES (
          ?,
          ?,
          ?,
          'open'
        )
      `,
      [
        id,
        tenantId,
        clientUserId,
      ]
    );

    return findConversationById({
      tenantId,
      conversationId:
        id,
    });
  };

/*
|--------------------------------------------------------------------------
| Tenant conversation list
|--------------------------------------------------------------------------
*/

const listTenantConversations =
  async ({
    tenantId,
    limit,
    offset,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            c.id,
            c.tenant_id,
            c.client_user_id,
            c.status,
            c.last_message_at,
            c.created_at,
            c.updated_at,

            u.first_name
              AS client_first_name,

            u.middle_name
              AS client_middle_name,

            u.last_name
              AS client_last_name,

            u.email
              AS client_email,

            (
              SELECT
                cm.body

              FROM conversation_messages cm

              WHERE
                cm.conversation_id =
                  c.id
                AND
                cm.deleted_at
                  IS NULL

              ORDER BY
                cm.created_at
                  DESC

              LIMIT 1
            ) AS last_message,

            (
              SELECT
                cm.created_at

              FROM conversation_messages cm

              WHERE
                cm.conversation_id =
                  c.id
                AND
                cm.deleted_at
                  IS NULL

              ORDER BY
                cm.created_at
                  DESC

              LIMIT 1
            ) AS last_message_created_at

          FROM conversations c

          INNER JOIN users u
            ON u.id =
              c.client_user_id

          WHERE
            c.tenant_id = ?
            AND
            c.status <> 'archived'

          ORDER BY
            COALESCE(
              c.last_message_at,
              c.created_at
            ) DESC

          LIMIT ?
          OFFSET ?
        `,
        [
          tenantId,
          limit,
          offset,
        ]
      );

    return rows;
  };

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

const createMessage =
  async ({
    connection = db,

    tenantId,
    conversationId,

    senderUserId,
    senderType,

    body,
    messageType = "text",
  }) => {
    const id =
      randomUUID();

    await connection.query(
      `
        INSERT INTO conversation_messages (
          id,
          tenant_id,
          conversation_id,
          sender_user_id,
          sender_type,
          message_type,
          body
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        id,
        tenantId,
        conversationId,
        senderUserId,
        senderType,
        messageType,
        body,
      ]
    );

    await connection.query(
      `
        UPDATE conversations

        SET
          last_message_at =
            NOW(),

          updated_at =
            NOW()

        WHERE id = ?
          AND tenant_id = ?
      `,
      [
        conversationId,
        tenantId,
      ]
    );

    return findMessageById({
      connection,

      tenantId,

      messageId:
        id,
    });
  };

const findMessageById =
  async ({
    connection = db,

    tenantId,
    messageId,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            cm.*,

            u.first_name
              AS sender_first_name,

            u.middle_name
              AS sender_middle_name,

            u.last_name
              AS sender_last_name,

            u.email
              AS sender_email

          FROM conversation_messages cm

          INNER JOIN users u
            ON u.id =
              cm.sender_user_id

          WHERE
            cm.id = ?
            AND
            cm.tenant_id = ?

          LIMIT 1
        `,
        [
          messageId,
          tenantId,
        ]
      );

    return rows[0] || null;
  };

const listMessages =
  async ({
    tenantId,
    conversationId,
    limit,
    offset,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            cm.*,

            u.first_name
              AS sender_first_name,

            u.middle_name
              AS sender_middle_name,

            u.last_name
              AS sender_last_name,

            u.email
              AS sender_email

          FROM conversation_messages cm

          INNER JOIN users u
            ON u.id =
              cm.sender_user_id

          WHERE
            cm.tenant_id = ?
            AND
            cm.conversation_id = ?
            AND
            cm.deleted_at IS NULL

          ORDER BY
            cm.created_at ASC

          LIMIT ?
          OFFSET ?
        `,
        [
          tenantId,
          conversationId,
          limit,
          offset,
        ]
      );

    return rows;
  };

const countMessages =
  async ({
    tenantId,
    conversationId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            COUNT(*) AS total

          FROM conversation_messages

          WHERE
            tenant_id = ?
            AND
            conversation_id = ?
            AND
            deleted_at IS NULL
        `,
        [
          tenantId,
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
    tenantId,
    conversationId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT *

          FROM conversation_reads

          WHERE
            tenant_id = ?
            AND
            conversation_id = ?
            AND
            user_id = ?

          LIMIT 1
        `,
        [
          tenantId,
          conversationId,
          userId,
        ]
      );

    return rows[0] || null;
  };

const markConversationRead =
  async ({
    tenantId,
    conversationId,
    userId,
    lastReadMessageId = null,
  }) => {
    const existing =
      await findReadState({
        tenantId,
        conversationId,
        userId,
      });

    if (existing) {
      await db.query(
        `
          UPDATE conversation_reads

          SET
            last_read_message_id = ?,
            last_read_at = NOW()

          WHERE
            tenant_id = ?
            AND
            conversation_id = ?
            AND
            user_id = ?
        `,
        [
          lastReadMessageId,
          tenantId,
          conversationId,
          userId,
        ]
      );
    } else {
      await db.query(
        `
          INSERT INTO conversation_reads (
            id,
            tenant_id,
            conversation_id,
            user_id,
            last_read_message_id,
            last_read_at
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW()
          )
        `,
        [
          randomUUID(),
          tenantId,
          conversationId,
          userId,
          lastReadMessageId,
        ]
      );
    }

    return findReadState({
      tenantId,
      conversationId,
      userId,
    });
  };

/*
|--------------------------------------------------------------------------
| Unread counts
|--------------------------------------------------------------------------
*/

const countUnreadForUser =
  async ({
    tenantId,
    conversationId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            COUNT(*) AS unread_count

          FROM conversation_messages cm

          LEFT JOIN conversation_reads cr
            ON
              cr.conversation_id =
                cm.conversation_id
              AND
              cr.user_id = ?

          WHERE
            cm.tenant_id = ?
            AND
            cm.conversation_id = ?
            AND
            cm.sender_user_id <> ?
            AND
            cm.deleted_at IS NULL
            AND
            (
              cr.last_read_at IS NULL
              OR
              cm.created_at >
                cr.last_read_at
            )
        `,
        [
          userId,
          tenantId,
          conversationId,
          userId,
        ]
      );

    return Number(
      rows[0]?.unread_count ||
        0
    );
  };

const countTotalUnreadForTenantUser =
  async ({
    tenantId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            COUNT(*) AS unread_count

          FROM conversation_messages cm

          INNER JOIN conversations c
            ON c.id =
              cm.conversation_id

          LEFT JOIN conversation_reads cr
            ON
              cr.conversation_id =
                cm.conversation_id
              AND
              cr.user_id = ?

          WHERE
            cm.tenant_id = ?
            AND
            c.status <> 'archived'
            AND
            cm.sender_user_id <> ?
            AND
            cm.deleted_at IS NULL
            AND
            (
              cr.last_read_at IS NULL
              OR
              cm.created_at >
                cr.last_read_at
            )
        `,
        [
          userId,
          tenantId,
          userId,
        ]
      );

    return Number(
      rows[0]?.unread_count ||
        0
    );
  };

/*
|--------------------------------------------------------------------------
| Conversation status
|--------------------------------------------------------------------------
*/

const updateConversationStatus =
  async ({
    tenantId,
    conversationId,
    status,
  }) => {
    await db.query(
      `
        UPDATE conversations

        SET status = ?

        WHERE id = ?
          AND tenant_id = ?
      `,
      [
        status,
        conversationId,
        tenantId,
      ]
    );

    return findConversationById({
      tenantId,
      conversationId,
    });
  };

/*
|--------------------------------------------------------------------------
| Client / tenant membership verification
|--------------------------------------------------------------------------
*/

const findTenantClient =
  async ({
    tenantId,
    clientUserId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,
            u.status
              AS user_status,

            tm.id
              AS membership_id,

            tm.status
              AS membership_status,

            r.id
              AS role_id,

            r.name
              AS role_name,

            r.code
              AS role_code

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id =
              tm.user_id

          INNER JOIN roles r
            ON r.id =
              tm.role_id

          WHERE
            tm.tenant_id = ?
            AND
            tm.user_id = ?

          LIMIT 1
        `,
        [
          tenantId,
          clientUserId,
        ]
      );

    return rows[0] || null;
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  db,

  findConversationById,
  findConversationByClient,
  createConversation,

  listTenantConversations,

  createMessage,
  findMessageById,
  listMessages,
  countMessages,

  findReadState,
  markConversationRead,

  countUnreadForUser,
  countTotalUnreadForTenantUser,

  updateConversationStatus,

  findTenantClient,
};