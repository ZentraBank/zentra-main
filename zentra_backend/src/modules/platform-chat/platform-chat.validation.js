const Joi =
  require("joi");


const pagination = {
  page:
    Joi.number()
      .integer()
      .min(1)
      .default(1),

  pageSize:
    Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(50),
};


/*
|--------------------------------------------------------------------------
| Tenant-side validation
|--------------------------------------------------------------------------
*/

const listTenantMessages = {
  query:
    Joi.object({
      ...pagination,
    }),
};


const sendTenantMessage = {
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


const markTenantConversationRead = {
  body:
    Joi.object({})
      .unknown(false),
};


/*
|--------------------------------------------------------------------------
| Platform-side validation
|--------------------------------------------------------------------------
*/

const listPlatformConversations = {
  query:
    Joi.object({
      page:
        Joi.number()
          .integer()
          .min(1)
          .default(1),

      pageSize:
        Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(20),

      status:
        Joi.string()
          .valid(
            "open",
            "closed"
          )
          .optional(),
    }),
};


const conversationId = {
  params:
    Joi.object({
      conversationId:
        Joi.string()
          .guid({
            version: [
              "uuidv4",
            ],
          })
          .required(),
    }),
};


const listPlatformMessages = {
  params:
    Joi.object({
      conversationId:
        Joi.string()
          .guid({
            version: [
              "uuidv4",
            ],
          })
          .required(),
    }),

  query:
    Joi.object({
      ...pagination,
    }),
};


const sendPlatformMessage = {
  params:
    Joi.object({
      conversationId:
        Joi.string()
          .guid({
            version: [
              "uuidv4",
            ],
          })
          .required(),
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


const markPlatformConversationRead = {
  params:
    Joi.object({
      conversationId:
        Joi.string()
          .guid({
            version: [
              "uuidv4",
            ],
          })
          .required(),
    }),

  body:
    Joi.object({})
      .unknown(false),
};


const updatePlatformConversationStatus = {
  params:
    Joi.object({
      conversationId:
        Joi.string()
          .guid({
            version: [
              "uuidv4",
            ],
          })
          .required(),
    }),

  body:
    Joi.object({
      status:
        Joi.string()
          .valid(
            "open",
            "closed"
          )
          .required(),
    }),
};


module.exports = {
  listTenantMessages,
  sendTenantMessage,
  markTenantConversationRead,

  listPlatformConversations,
  conversationId,
  listPlatformMessages,
  sendPlatformMessage,
  markPlatformConversationRead,
  updatePlatformConversationStatus,
};