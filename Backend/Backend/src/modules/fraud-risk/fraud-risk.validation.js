const Joi =
  require("joi");

const decisions = [
  "allow",
  "allow_with_otp",
  "require_step_up",
  "require_admin_approval",
  "block",
];

module.exports = {
  evaluate: {
    body:
      Joi.object({
        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

        userId:
          Joi.string()
            .uuid()
            .optional(),

        eventType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        sourceType:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        sourceId:
          Joi.string()
            .uuid()
            .optional(),

        amount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        ipAddress:
          Joi.string()
            .ip()
            .optional(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        deviceFingerprint:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        deviceName:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        deviceType:
          Joi.string()
            .trim()
            .max(80)
            .optional(),

        operatingSystem:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        browser:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        deviceMetadata:
          Joi.object()
            .unknown(true)
            .optional(),

        payload:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createRule: {
    body:
      Joi.object({
        code:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        name:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        description:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        eventType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        conditionType:
          Joi.string()
            .valid(
              "amount_threshold",
              "velocity",
              "new_device",
              "ip_change",
              "country_change",
              "failed_attempts",
              "dormant_account",
              "manual"
            )
            .required(),

        configuration:
          Joi.object()
            .unknown(true)
            .required(),

        score:
          Joi.number()
            .integer()
            .min(0)
            .max(100)
            .required(),

        decision:
          Joi.string()
            .valid(...decisions)
            .allow(null)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .default("active"),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(100),
      }),
  },

  listRules: {
    query:
      Joi.object({
        eventType:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .optional(),
      }),
  },

  updateRule: {
    params:
      Joi.object({
        ruleId:
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
            .max(180)
            .optional(),

        description:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        configuration:
          Joi.object()
            .unknown(true)
            .optional(),

        score:
          Joi.number()
            .integer()
            .min(0)
            .max(100)
            .optional(),

        decision:
          Joi.string()
            .valid(...decisions)
            .allow(null)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .optional(),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .optional(),
      }).min(1),
  },

  listFraudCases: {
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
              "investigating",
              "escalated",
              "resolved",
              "dismissed"
            )
            .optional(),

        severity:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .optional(),
      }),
  },

  caseId: {
    params:
      Joi.object({
        caseId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  updateFraudCase: {
    params:
      Joi.object({
        caseId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "open",
              "investigating",
              "escalated",
              "resolved",
              "dismissed"
            )
            .optional(),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        resolutionNote:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),
      }).min(1),
  },
};
