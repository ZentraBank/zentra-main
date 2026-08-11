const Joi =
  require("joi");

module.exports = {
  screen: {
    body:
      Joi.object({
        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(180)
            .required(),

        userId:
          Joi.string()
            .uuid()
            .optional(),

        screeningType:
          Joi.string()
            .valid(
              "customer_onboarding",
              "periodic_review",
              "transaction_party",
              "manual"
            )
            .required(),

        subjectName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        dateOfBirth:
          Joi.date()
            .iso()
            .optional(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        identificationNumber:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        minimumMatchScore:
          Joi.number()
            .min(0)
            .max(100)
            .default(60),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createMonitoringRule: {
    body:
      Joi.object({
        code:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(140)
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
            .max(140)
            .required(),

        ruleType:
          Joi.string()
            .valid(
              "amount_threshold",
              "velocity",
              "structuring",
              "country_risk",
              "customer_profile_deviation",
              "rapid_movement",
              "manual"
            )
            .required(),

        configuration:
          Joi.object()
            .unknown(true)
            .required(),

        severity:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .required(),

        score:
          Joi.number()
            .integer()
            .min(0)
            .max(100)
            .required(),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(100),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .default("active"),
      }),
  },

  monitorTransaction: {
    body:
      Joi.object({
        userId:
          Joi.string()
            .uuid()
            .required(),

        eventType:
          Joi.string()
            .trim()
            .min(2)
            .max(140)
            .required(),

        sourceType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        sourceId:
          Joi.string()
            .uuid()
            .optional(),

        amount:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        payload:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  updateRiskProfile: {
    params:
      Joi.object({
        userId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        riskScore:
          Joi.number()
            .integer()
            .min(0)
            .max(100)
            .required(),

        riskLevel:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "prohibited"
            )
            .required(),

        customerType:
          Joi.string()
            .valid(
              "individual",
              "business"
            )
            .default("individual"),

        occupation:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        industry:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        expectedMonthlyVolume:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        expectedMonthlyCount:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        countryOfResidence:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        nationality:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        pepStatus:
          Joi.string()
            .valid(
              "unknown",
              "not_pep",
              "pep",
              "relative_or_close_associate"
            )
            .default("unknown"),

        sanctionsStatus:
          Joi.string()
            .valid(
              "not_screened",
              "clear",
              "potential_match",
              "confirmed_match"
            )
            .default("not_screened"),

        sourceOfFunds:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),

        sourceOfWealth:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),

        nextReviewAt:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listAlerts: {
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
              "closed_false_positive",
              "closed_no_action",
              "reported"
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

  updateAlert: {
    params:
      Joi.object({
        alertId:
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
              "closed_false_positive",
              "closed_no_action",
              "reported"
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

  createCase: {
    body:
      Joi.object({
        userId:
          Joi.string()
            .uuid()
            .optional(),

        title:
          Joi.string()
            .trim()
            .min(3)
            .max(220)
            .required(),

        description:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "urgent"
            )
            .default("medium"),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        alertIds:
          Joi.array()
            .items(
              Joi.string().uuid()
            )
            .min(1)
            .unique()
            .required(),
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

  updateCase: {
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
              "awaiting_information",
              "escalated",
              "closed",
              "reported"
            )
            .optional(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "urgent"
            )
            .optional(),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        decision:
          Joi.string()
            .valid(
              "pending",
              "no_action",
              "enhanced_due_diligence",
              "restrict_account",
              "exit_relationship",
              "file_report"
            )
            .optional(),

        decisionReason:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),
      }).min(1),
  },

  createSar: {
    params:
      Joi.object({
        caseId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        jurisdiction:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        reportType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        narrative:
          Joi.string()
            .trim()
            .min(50)
            .required(),

        subjectDetails:
          Joi.object()
            .unknown(true)
            .required(),

        transactionSummary:
          Joi.object()
            .unknown(true)
            .optional(),

        supportingEvidence:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },
};
