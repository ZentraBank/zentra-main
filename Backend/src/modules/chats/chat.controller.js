const chatService = require("./chat.service");

async function startConversation(req, res, next) {
  try {
    const result = await chatService.startConversation({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
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
    const conversations = await chatService.getConversations({
      tenantId: req.tenant.id,
      user: req.user,
    });

    return res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const messages = await chatService.getConversationMessages({
      tenantId: req.tenant.id,
      user: req.user,
      conversationId: req.params.id,
    });

    return res.json({
      success: true,
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