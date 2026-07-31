const chatRepo = require("./chat.repository");
const ApiError = require("../../utils/ApiError");

function isAdmin(user) {
  return ["tenant_admin", "super_admin"].includes(user.role_code || user.role);
}

async function startConversation({ tenantId, user, subject, message }) {
  if (!message) {
    throw ApiError.badRequest("Message is required");
  }

  const conversationId = await chatRepo.createConversation({
    tenantId,
    userId: user.id,
    subject,
  });

  await chatRepo.createMessage({
    tenantId,
    conversationId,
    senderId: user.id,
    message,
  });

  return {
    conversation_id: conversationId,
  };
}

async function getConversations({ tenantId, user, limit, offset, filters }) {
  if (isAdmin(user)) {
    return chatRepo.getTenantConversations({
      tenantId,
      limit,
      offset,
      status: filters.status,
    });
  }

  return chatRepo.getUserConversations({
    tenantId,
    userId: user.id,
    limit,
    offset,
    status: filters.status,
  });
}

async function getConversationMessages({
  tenantId,
  user,
  conversationId,
  limit,
  offset,
}) {
  const conversation = await chatRepo.findConversationById({
    tenantId,
    conversationId,
  });

  if (!conversation) {
    throw ApiError.notFound("Conversation not found");
  }

  if (!isAdmin(user) && conversation.user_id !== user.id) {
    throw ApiError.forbidden("You do not have permission to view this conversation");
  }

  return chatRepo.getMessages({
    tenantId,
    conversationId,
    limit,
    offset,
  });
}

async function sendMessage({ tenantId, user, conversationId, message }) {
  if (!message) {
    throw ApiError.badRequest("Message is required");
  }

  const conversation = await chatRepo.findConversationById({
    tenantId,
    conversationId,
  });

  if (!conversation) {
    throw ApiError.notFound("Conversation not found");
  }

  if (conversation.status === "closed") {
    throw ApiError.badRequest("Conversation is closed");
  }

  if (!isAdmin(user) && conversation.user_id !== user.id) {
    throw ApiError.forbidden("You do not have permission to send messages here");
  }

  const messageId = await chatRepo.createMessage({
    tenantId,
    conversationId,
    senderId: user.id,
    message,
  });

  return {
    message_id: messageId,
  };
}

async function closeConversation({ tenantId, user, conversationId }) {
  if (!isAdmin(user)) {
    throw ApiError.forbidden("Only tenant administrators can close conversations");
  }

  const closed = await chatRepo.closeConversation({
    tenantId,
    conversationId,
  });

  if (!closed) {
    throw ApiError.notFound("Conversation not found");
  }

  return true;
}

module.exports = {
  startConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
  closeConversation,
};