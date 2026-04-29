const chatService = require("./chat.service");

const {
  emitToConversation,
  emitToTenantAdmins,
} = require("../../utils/socket");

async function startConversation(req, res, next) {
  try {
    const result = await chatService.startConversation({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
    });

    emitToTenantAdmins(req, req.tenant.id, "chat:conversation:new", {
      conversation_id: result.conversation_id,
      tenant_id: req.tenant.id,
      user_id: req.user.id,
      subject: req.body.subject || "Support request",
      message: req.body.message,
    });

    return res.status(201).json({
      success: true,
      message: "Conversation started",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getConversations(req, res, next) {
  try {
    const { getPagination, cleanFilters } = require("../../utils/query");

    const { limit, page, offset } = getPagination(req.query);
    const filters = cleanFilters(req.query, ["status"]);

    const conversations = await chatService.getConversations({
      tenantId: req.tenant.id,
      user: req.user,
      limit,
      offset,
      filters,
    });

    return res.json({
      success: true,
      meta: {
        page,
        limit,
        filters,
      },
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const { getPagination } = require("../../utils/query");

    const { limit, page, offset } = getPagination(req.query);

    const messages = await chatService.getConversationMessages({
      tenantId: req.tenant.id,
      user: req.user,
      conversationId: req.params.id,
      limit,
      offset,
    });

    return res.json({
      success: true,
      meta: {
        page,
        limit,
      },
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const result = await chatService.sendMessage({
      tenantId: req.tenant.id,
      user: req.user,
      conversationId: req.params.id,
      message: req.body.message,
    });

    emitToConversation(req, req.params.id, "chat:message:new", {
      message_id: result.message_id,
      conversation_id: Number(req.params.id),
      sender_id: req.user.id,
      sender_role: req.user.role,
      message: req.body.message,
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function closeConversation(req, res, next) {
  try {
    await chatService.closeConversation({
      tenantId: req.tenant.id,
      user: req.user,
      conversationId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Conversation closed",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
  closeConversation,
};