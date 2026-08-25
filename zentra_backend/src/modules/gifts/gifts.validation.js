const Joi = require("joi");

const statuses = [
  "pending",
  "accepted",
  "declined",
  "redemption_pending_review",
  "redemption_rejected",
  "processed",
  "cancelled",
  "expired",
];

const currencies = [
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "JPY",
  "NGN",
];

const redemptionPaymentMethods = [
  "bank_transfer",
  "card",
  "cash_deposit",
  "other",
];

const redemptionProofStatuses = [
  "approved",
  "rejected",
];

module.exports = {
  createGift: {
    body: Joi.object({
      accountNumber: Joi.string()
        .trim()
        .min(4)
        .max(50)
        .required(),

      amount: Joi.number()
        .positive()
        .precision(2)
        .required(),

      redemptionFee: Joi.number()
        .min(0)
        .precision(2)
        .required(),

      currency: Joi.string()
        .uppercase()
        .valid(...currencies)
        .required(),

      senderName: Joi.string()
        .trim()
        .min(2)
        .max(180)
        .required(),

      message: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional(),

      expiresAt: Joi.date()
        .iso()
        .greater("now")
        .required(),
    }),
  },

  updateGift: {
    params: Joi.object({
      giftId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      accountNumber: Joi.string()
        .trim()
        .min(4)
        .max(50)
        .optional(),

      amount: Joi.number()
        .positive()
        .precision(2)
        .optional(),

      redemptionFee: Joi.number()
        .min(0)
        .precision(2)
        .optional(),

      currency: Joi.string()
        .uppercase()
        .valid(...currencies)
        .optional(),

      senderName: Joi.string()
        .trim()
        .min(2)
        .max(180)
        .optional(),

      message: Joi.string()
        .trim()
        .max(2000)
        .allow("", null)
        .optional(),

      expiresAt: Joi.date()
        .iso()
        .greater("now")
        .optional(),
    })
      .min(1),
  },

  listTenant: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      pageSize: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      status: Joi.string()
        .valid(...statuses)
        .optional(),
    }),
  },

  listMine: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      pageSize: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      status: Joi.string()
        .valid(...statuses)
        .optional(),
    }),
  },

  giftId: {
    params: Joi.object({
      giftId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  decision: {
    params: Joi.object({
      giftId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      decision: Joi.string()
        .valid(
          "accepted",
          "declined"
        )
        .required(),
    }),
  },

  cancelGift: {
    params: Joi.object({
      giftId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  submitRedemptionProof: {
  params: Joi.object({
    giftId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    fileId: Joi.string()
      .uuid()
      .required(),

    amountPaid: Joi.number()
      .positive()
      .precision(2)
      .required(),

    paymentReference: Joi.string()
      .trim()
      .max(180)
      .allow("", null)
      .optional(),

    paymentMethod: Joi.string()
      .valid(
        ...redemptionPaymentMethods
      )
      .required(),

    note: Joi.string()
      .trim()
      .max(1000)
      .allow("", null)
      .optional(),
  }),
},
giftRedemptionProof: {
  params: Joi.object({
    giftId: Joi.string()
      .uuid()
      .required(),
  }),
},
reviewRedemptionProof: {
  params: Joi.object({
    giftId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    status: Joi.string()
      .valid(
        ...redemptionProofStatuses
      )
      .required(),

    rejectionReason:
      Joi.when(
        "status",
        {
          is: "rejected",

          then:
            Joi.string()
              .trim()
              .min(3)
              .max(2000)
              .required(),

          otherwise:
            Joi.string()
              .trim()
              .max(2000)
              .allow("", null)
              .optional(),
        }
      ),
  }),
},

};