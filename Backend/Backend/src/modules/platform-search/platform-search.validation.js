const Joi = require("joi");

const common = {
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  search: Joi.string()
    .trim()
    .max(255)
    .optional(),

  tenantId: Joi.string()
    .uuid()
    .optional(),

  status: Joi.string()
    .trim()
    .max(80)
    .optional(),
};

module.exports = {
  users: {
    query: Joi.object({
      ...common,

      userType: Joi.string()
        .valid(
          "customer",
          "tenant_admin",
          "staff"
        )
        .optional(),
    }),
  },

  accounts: {
    query: Joi.object({
      ...common,

      accountType: Joi.string()
        .trim()
        .max(120)
        .optional(),
    }),
  },

  transactions: {
    query: Joi.object({
      ...common,

      transactionType:
        Joi.string()
          .trim()
          .max(120)
          .optional(),

      dateFrom: Joi.date()
        .iso()
        .optional(),

      dateTo: Joi.date()
        .iso()
        .min(Joi.ref("dateFrom"))
        .optional(),
    }),
  },
};
