const Joi = require("joi");

module.exports = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),

      severity: Joi.string()
        .valid(
          "info",
          "low",
          "medium",
          "high",
          "critical"
        )
        .optional(),

      type: Joi.string()
        .valid(
          "tenant_created",
          "tenant_suspended",
          "subscription_past_due",
          "security_alert",
          "system_incident",
          "compliance_alert",
          "general"
        )
        .optional(),

      unreadOnly: Joi.boolean().default(false),
    }),
  },

  notificationId: {
    params: Joi.object({
      notificationId:
        Joi.string().uuid().required(),
    }),
  },

  create: {
    body: Joi.object({
      type: Joi.string()
        .valid(
          "tenant_created",
          "tenant_suspended",
          "subscription_past_due",
          "security_alert",
          "system_incident",
          "compliance_alert",
          "general"
        )
        .required(),

      severity: Joi.string()
        .valid(
          "info",
          "low",
          "medium",
          "high",
          "critical"
        )
        .required(),

      title: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required(),

      message: Joi.string()
        .trim()
        .min(2)
        .max(10000)
        .required(),

      tenantId: Joi.string()
        .uuid()
        .allow(null)
        .optional(),

      entityType: Joi.string()
        .trim()
        .max(120)
        .allow(null)
        .optional(),

      entityId: Joi.string()
        .uuid()
        .allow(null)
        .optional(),

      recipientUserIds: Joi.array()
        .items(Joi.string().uuid())
        .unique()
        .min(1)
        .required(),
    }),
  },
  sendToTenants: {
  body: Joi.object({
    audienceType: Joi.string()
      .valid(
        "single_tenant",
        "selected_tenants",
        "all_tenants"
      )
      .required(),

    tenantId: Joi.when(
      "audienceType",
      {
        is: "single_tenant",
        then: Joi.string()
          .uuid()
          .required(),

        otherwise: Joi.forbidden(),
      }
    ),

    tenantIds: Joi.when(
      "audienceType",
      {
        is: "selected_tenants",
        then: Joi.array()
          .items(
            Joi.string().uuid()
          )
          .unique()
          .min(1)
          .max(100)
          .required(),

        otherwise: Joi.forbidden(),
      }
    ),

    title: Joi.string()
      .trim()
      .min(2)
      .max(255)
      .required(),

    message: Joi.string()
      .trim()
      .min(2)
      .max(10000)
      .required(),

    priority: Joi.string()
      .valid(
        "low",
        "normal",
        "high",
        "urgent"
      )
      .default("normal"),

    actionUrl: Joi.string()
      .trim()
      .max(2048)
      .allow(null, "")
      .optional(),

    entityType: Joi.string()
      .trim()
      .max(120)
      .allow(null, "")
      .optional(),

    entityId: Joi.string()
      .uuid()
      .allow(null)
      .optional(),

    metadata: Joi.object()
      .unknown(true)
      .optional(),
  }),
},
};
