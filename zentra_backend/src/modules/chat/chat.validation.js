const Joi =
  require("joi");

const uuid =
  Joi.string()
    .guid({
      version: [
        "uuidv4",
      ],
    });

const pagination = {
  page:
    Joi.number()
      .integer()
      .min(1)
      .optional(),

  pageSize:
    Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional(),
};

const listTenantConversations = {
  query:
    Joi.object({
      ...pagination,
    }),
};

const createTenantConversation = {
  params:
    Joi.object({
      clientUserId:
        uuid.required(),
    }),
};

const conversationId = {
  params:
    Joi.object({
      conversationId:
        uuid.required(),
    }),
};

const listTenantMessages = {
  params:
    Joi.object({
      conversationId:
        uuid.required(),
    }),

  query:
    Joi.object({
      ...pagination,
    }),
};

const sendTenantMessage = {
  params:
    Joi.object({
      conversationId:
        uuid.required(),
    }),

  body:
    Joi.object({
      message:
        Joi.string()
          .trim()
          .min(1)
          .max(5000)
          .required(),
    }),
};

const markTenantRead = {
  params:
    Joi.object({
      conversationId:
        uuid.required(),
    }),

  body:
    Joi.object({
      lastReadMessageId:
        uuid
          .allow(
            null
          )
          .optional(),
    }),
};

const updateConversationStatus = {
  params:
    Joi.object({
      conversationId:
        uuid.required(),
    }),

  body:
    Joi.object({
      status:
        Joi.string()
          .valid(
            "open",
            "closed",
            "archived"
          )
          .required(),
    }),
};

const listMyMessages = {
  query:
    Joi.object({
      ...pagination,
    }),
};

const sendMyMessage = {
  body:
    Joi.object({
      message:
        Joi.string()
          .trim()
          .min(1)
          .max(5000)
          .required(),
    }),
};

const markMyConversationRead = {
  body:
    Joi.object({
      lastReadMessageId:
        uuid
          .allow(
            null
          )
          .optional(),
    }),
};

module.exports = {
  listTenantConversations,
  createTenantConversation,
  conversationId,
  listTenantMessages,
  sendTenantMessage,
  markTenantRead,
  updateConversationStatus,

  listMyMessages,
  sendMyMessage,
  markMyConversationRead,
};