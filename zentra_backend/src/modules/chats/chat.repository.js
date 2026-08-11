const db = require("../../config/db");

async function createConversation({ tenantId, userId, subject }) {
  const id = require("crypto").randomUUID();
  await db.query(
    `INSERT INTO chat_conversations (id, tenant_id, user_id, subject, status)
     VALUES (?, ?, ?, ?, 'open')`,
    [id, tenantId, userId, subject || "Support request"]
  );
  return id;
}

async function createMessage({ tenantId, conversationId, senderId, message }) {
  const id = require("crypto").randomUUID();
  await db.query(
    `INSERT INTO chat_messages (id, tenant_id, conversation_id, sender_id, message)
     VALUES (?, ?, ?, ?, ?)`,
    [id, tenantId, conversationId, senderId, message]
  );
  await db.query(
    `UPDATE chat_conversations SET last_message_at = CURRENT_TIMESTAMP
     WHERE id = ? AND tenant_id = ?`,
    [conversationId, tenantId]
  );
  return id;
}

async function findConversationById({ tenantId, conversationId }) {
  const [rows] = await db.query(
    `SELECT c.*, u.first_name, u.last_name, u.email
     FROM chat_conversations c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ? AND c.tenant_id = ? AND c.deleted_at IS NULL
     LIMIT 1`,
    [conversationId, tenantId]
  );
  return rows[0] || null;
}

async function getUserConversations({ tenantId, userId, limit, offset, status }) {
  const params = [tenantId, userId];
  let statusSql = "";
  if (status) { statusSql = " AND c.status = ?"; params.push(status); }
  params.push(limit, offset);
  const [rows] = await db.query(
    `SELECT c.*, (
       SELECT m.message FROM chat_messages m
       WHERE m.conversation_id = c.id AND m.tenant_id = c.tenant_id
       ORDER BY m.created_at DESC LIMIT 1
     ) AS last_message
     FROM chat_conversations c
     WHERE c.tenant_id = ? AND c.user_id = ? AND c.deleted_at IS NULL${statusSql}
     ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
}

async function getTenantConversations({ tenantId, limit, offset, status }) {
  const params = [tenantId];
  let statusSql = "";
  if (status) { statusSql = " AND c.status = ?"; params.push(status); }
  params.push(limit, offset);
  const [rows] = await db.query(
    `SELECT c.*, u.first_name, u.last_name, u.email, (
       SELECT m.message FROM chat_messages m
       WHERE m.conversation_id = c.id AND m.tenant_id = c.tenant_id
       ORDER BY m.created_at DESC LIMIT 1
     ) AS last_message
     FROM chat_conversations c
     JOIN users u ON u.id = c.user_id
     WHERE c.tenant_id = ? AND c.deleted_at IS NULL${statusSql}
     ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
}

async function getMessages({ tenantId, conversationId, limit, offset }) {
  const [rows] = await db.query(
    `SELECT m.id, m.conversation_id, m.sender_id, m.message, m.created_at,
            u.first_name, u.last_name,
            CASE WHEN tm.role_id IS NULL THEN 'customer' ELSE r.code END AS sender_role
     FROM chat_messages m
     JOIN users u ON u.id = m.sender_id
     LEFT JOIN tenant_memberships tm ON tm.user_id = m.sender_id AND tm.tenant_id = m.tenant_id AND tm.status = 'active'
     LEFT JOIN roles r ON r.id = tm.role_id
     WHERE m.tenant_id = ? AND m.conversation_id = ? AND m.deleted_at IS NULL
     ORDER BY m.created_at ASC
     LIMIT ? OFFSET ?`,
    [tenantId, conversationId, limit, offset]
  );
  return rows;
}

async function closeConversation({ tenantId, conversationId }) {
  const [result] = await db.query(
    `UPDATE chat_conversations SET status = 'closed', closed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL`,
    [conversationId, tenantId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createConversation,
  createMessage,
  findConversationById,
  getUserConversations,
  getTenantConversations,
  getMessages,
  closeConversation,
};
