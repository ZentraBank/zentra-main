const Joi =
  require("joi");

module.exports = {
  createProduct: {
    body:
      Joi.object({
        name:
          Joi.string()
            .trim()
            .min(2)
            .max(160)
            .required(),

        description:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        minimumAmount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        maximumAmount:
          Joi.number()
            .positive()
            .precision(2)
            .greater(
              Joi.ref("minimumAmount")
            )
            .optional(),

        annualRate:
          Joi.number()
            .positive()
            .max(100)
            .precision(4)
            .required(),

        durationDays:
          Joi.number()
            .integer()
            .min(1)
            .max(3650)
            .required(),

        payoutType:
          Joi.string()
            .valid(
              "at_maturity",
              "monthly",
              "quarterly"
            )
            .default(
              "at_maturity"
            ),

        riskLevel:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high"
            )
            .default("low"),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "paused",
              "closed"
            )
            .default("draft"),
      }),
  },

  updateProduct: {
    params:
      Joi.object({
        productId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        name:
          Joi.string()
            .trim()
            .min(2)
            .max(160)
            .optional(),

        description:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        minimumAmount:
          Joi.number()
            .positive()
            .precision(2)
            .optional(),

        maximumAmount:
          Joi.number()
            .positive()
            .precision(2)
            .optional(),

        annualRate:
          Joi.number()
            .positive()
            .max(100)
            .precision(4)
            .optional(),

        durationDays:
          Joi.number()
            .integer()
            .min(1)
            .max(3650)
            .optional(),

        payoutType:
          Joi.string()
            .valid(
              "at_maturity",
              "monthly",
              "quarterly"
            )
            .optional(),

        riskLevel:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high"
            )
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "paused",
              "closed"
            )
            .optional(),
      }).min(1),
  },

  list: {
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
              "draft",
              "active",
              "paused",
              "closed",
              "pending",
              "matured",
              "withdrawal_requested",
              "completed",
              "cancelled",
              "approved",
              "rejected"
            )
            .optional(),
      }),
  },

  subscribe: {
    body:
      Joi.object({
        productId:
          Joi.string()
            .uuid()
            .required(),

        sourceAccountId:
          Joi.string()
            .uuid()
            .required(),

        amount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),
      }),
  },

  requestWithdrawal: {
    params:
      Joi.object({
        investmentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        destinationAccountId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  reviewWithdrawal: {
    params:
      Joi.object({
        withdrawalId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "approved",
              "rejected"
            )
            .required(),

        rejectionReason:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },

  withdrawalId: {
    params:
      Joi.object({
        withdrawalId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },
};
