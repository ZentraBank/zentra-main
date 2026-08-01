const Joi = require("joi");

const roles = [
  "platform_superadmin",
  "platform_support",
  "platform_auditor",
];

module.exports = {
  listUsers: {
    query: Joi.object({
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

      role: Joi.string()
        .valid(...roles)
        .optional(),

      status: Joi.string()
        .valid(
          "pending",
          "active",
          "suspended",
          "disabled"
        )
        .optional(),
    }),
  },

  userId: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  },

  createUser: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .max(255)
        .required(),

      firstName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

      lastName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

      roleCode: Joi.string()
        .valid(...roles)
        .required(),

      status: Joi.string()
        .valid(
          "pending",
          "active",
          "suspended",
          "disabled"
        )
        .default("active"),

      temporaryPassword: Joi.string()
        .min(12)
        .max(128)
        .required(),

      permissions: Joi.array()
        .items(
          Joi.string()
            .trim()
            .min(3)
            .max(180)
        )
        .unique()
        .min(1)
        .required(),
    }),
  },

  updateUser: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      firstName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

      lastName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

      roleCode: Joi.string()
        .valid(...roles)
        .optional(),
    }).min(1),
  },

  updatePermissions: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      permissions: Joi.array()
        .items(
          Joi.string()
            .trim()
            .min(3)
            .max(180)
        )
        .unique()
        .required(),
    }),
  },

  updateStatus: {
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(
          "active",
          "suspended",
          "disabled"
        )
        .required(),
    }),
  },
};
