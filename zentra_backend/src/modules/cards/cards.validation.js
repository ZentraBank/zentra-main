const Joi = require("joi");

const supportedCardTypes = [
  "virtual",
  "physical",
  "celebrity",
  "cryptocurrency",
  "official",
  "merchant",
];

const purchaseRequestStatuses = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

module.exports = {
  create: {
    body: Joi.object({
      accountId: Joi.string().uuid().required(),

      cardType: Joi.string()
        .valid(...supportedCardTypes)
        .required(),

      cardBrand: Joi.string()
        .trim()
        .min(2)
        .max(30)
        .default("Zentra"),
    }),
  },

  id: {
    params: Joi.object({
      cardId: Joi.string().uuid().required(),
    }),
  },

  ownStatus: {
    params: Joi.object({
      cardId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(
          "active",
          "frozen",
          "blocked",
          "inactive"
        )
        .required(),
    }),
  },

ownLimit: {
  params: Joi.object({
    cardId: Joi.string().uuid().required(),
  }),

  body: Joi.object({
    dailySpendLimit: Joi.number()
      .positive()
      .precision(2)
      .required(),
  }),
},


  adminStatus: {
    params: Joi.object({
      cardId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(
          "active",
          "frozen",
          "blocked",
          "inactive"
        )
        .required(),

      reason: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),
    }),
  },

  purchaseRequest: {
    body: Joi.object({
      accountId: Joi.string().uuid().required(),

      cardType: Joi.string()
        .valid(...supportedCardTypes)
        .required(),

      cardBrand: Joi.string()
        .trim()
        .min(2)
        .max(30)
        .default("Zentra"),

      paymentMethod: Joi.string()
        .valid("cryptocurrency")
        .default("cryptocurrency"),

      paymentReference: Joi.string()
        .trim()
        .max(120)
        .allow("")
        .optional(),

      paymentProofUrl: Joi.string()
        .uri()
        .max(1000)
        .allow("")
        .optional(),
    }),
  },

  purchaseRequestId: {
    params: Joi.object({
      requestId: Joi.string().uuid().required(),
    }),
  },

  adminPurchaseRequestList: {
    query: Joi.object({
      status: Joi.string()
        .valid(...purchaseRequestStatuses)
        .optional(),

      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      pageSize: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional(),
    }),
  },

  rejectPurchaseRequest: {
    params: Joi.object({
      requestId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      rejectionReason: Joi.string()
        .trim()
        .min(3)
        .max(500)
        .required(),
    }),
  },
};