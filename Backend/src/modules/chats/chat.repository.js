const db = require("../../config/db");

async function createConversation({ tenantId, userId, subject }) {
  const [result] = await db.query(
    `INSERT INTO conversations (tenant_id, user_id, subject)
     VALUES (?, ?, ?)`,
    [tenantId, userId, subject || "Support request"]
  );

  return result.insertId;
}

async function findConversationById({ tenantId, conversationId }) {
  const [rows] = await db.query(
    `SELECT * FROM conversations
     WHERE id = ? AND tenant_id = ?
     LIMIT 1`,
    [conversationId, tenantId]
  );

  return rows[0];
}

async function getUserConversations({ tenantId, userId }) {
  const [rows] = await db.query(
    `SELECT * FROM conversations
     WHERE tenant_id = ? AND user_id = ?
     ORDER BY updated_at DESC`,
    [tenantId, userId]
  );

  return rows;
}

async function getTenantConversations({ tenantId }) {
  const [rows] = await db.query(
    `SELECT c.*, u.full_name, u.email
     FROM conversations c
     JOIN users u ON u.id = c.user_id
     WHERE c.tenant_id = ?
     ORDER BY c.updated_at DESC`,
    [tenantId]
  );

  return rows;
}

async function createMessage({ tenantId, conversationId, senderId, message }) {
  const [result] = await db.query(
    `INSERT INTO messages
     (tenant_id, conversation_id, sender_id, message)
     VALUES (?, ?, ?, ?)`,
    [tenantId, conversationId, senderId, message]
  );

  await db.query(
    `UPDATE conversations
     SET updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND tenant_id = ?`,
    [conversationId, tenantId]
  );

  return result.insertId;
}

async function getMessages({ tenantId, conversationId }) {
  const [rows] = await db.query(
    `SELECT m.*, u.full_name, u.role
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.tenant_id = ? AND m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    [tenantId, conversationId]
  );

  return rows;
}

async function closeConversation({ tenantId, conversationId }) {
  const [result] = await db.query(
    `UPDATE conversations
     SET status = 'closed'
     WHERE id = ? AND tenant_id = ?`,
    [conversationId, tenantId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  createConversation,
  findConversationById,
  getUserConversations,
  getTenantConversations,
  createMessage,
  getMessages,
  closeConversation,
};