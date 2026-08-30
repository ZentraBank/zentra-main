const Joi = require("joi");

const roles = [
  "platform_superadmin",
  "platform_support",
  "platform_auditor",
];

const statuses = [
  "active",
  "inactive",
  "suspended",
];

const platformPermission = Joi.string()
  .trim()
  .pattern(
    /^platform\.[a-z0-9_]+(?:\.[a-z0-9_]+)*$/
  )
  .min(3)
  .max(180)
  .messages({
    "string.pattern.base":
      "Permissions must be valid platform permission codes.",
  });

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
        .valid(...statuses)
        .optional(),
    }),
  },

  userId: {
    params: Joi.object({
      userId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  createUser: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .max(255)
        .lowercase()
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
        .valid(...statuses)
        .default("active"),

      temporaryPassword: Joi.string()
        .min(12)
        .max(128)
        .required(),

      permissions: Joi.array()
        .items(platformPermission)
        .unique()
        .min(1)
        .required(),
    }),
  },

  updateUser: {
    params: Joi.object({
      userId: Joi.string()
        .uuid()
        .required(),
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
      userId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      permissions: Joi.array()
        .items(platformPermission)
        .unique()
        .required(),
    }),
  },

  updateStatus: {
    params: Joi.object({
      userId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(...statuses)
        .required(),
    }),
  },
};