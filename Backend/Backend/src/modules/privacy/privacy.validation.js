const Joi =
  require("joi");

module.exports = {
  createPurpose: {
    body:
      Joi.object({
        purposeCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        purposeName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        description:
          Joi.string()
            .max(5000)
            .optional(),

        lawfulBasis:
          Joi.string()
            .valid(
              "consent",
              "contract",
              "legal_obligation",
              "vital_interests",
              "public_task",
              "legitimate_interests"
            )
            .required(),

        dataCategories:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(2)
                .max(180)
            )
            .min(1)
            .max(100)
            .unique()
            .required(),

        processingActivities:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(2)
                .max(255)
            )
            .min(1)
            .max(100)
            .unique()
            .required(),

        retentionPolicyId:
          Joi.string()
            .uuid()
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "retired"
            )
            .default("draft"),
      }),
  },

  grantConsent: {
    body:
      Joi.object({
        privacyPurposeId:
          Joi.string()
            .uuid()
            .required(),

        consentVersion:
          Joi.string()
            .trim()
            .min(1)
            .max(80)
            .required(),

        consentTextHash:
          Joi.string()
            .hex()
            .length(64)
            .required(),

        collectionChannel:
          Joi.string()
            .valid(
              "web",
              "mobile",
              "branch",
              "call_centre",
              "api",
              "paper"
            )
            .required(),

        ipAddress:
          Joi.string()
            .ip()
            .optional(),

        userAgent:
          Joi.string()
            .max(1000)
            .optional(),

        expiresAt:
          Joi.date()
            .iso()
            .greater("now")
            .optional(),

        evidenceStorageKey:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  withdrawConsent: {
    params:
      Joi.object({
        consentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        reason:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },

  createDataSubjectRequest: {
    body:
      Joi.object({
        userId:
          Joi.string()
            .uuid()
            .optional(),

        requestType:
          Joi.string()
            .valid(
              "access",
              "rectification",
              "erasure",
              "restriction",
              "portability",
              "objection",
              "automated_decision_review"
            )
            .required(),

        requestChannel:
          Joi.string()
            .valid(
              "web",
              "mobile",
              "branch",
              "call_centre",
              "email",
              "api",
              "paper"
            )
            .required(),

        requestDetails:
          Joi.string()
            .max(10000)
            .optional(),

        responseDeadlineDays:
          Joi.number()
            .integer()
            .min(1)
            .max(365)
            .default(30),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        tasks:
          Joi.array()
            .items(
              Joi.object({
                systemName:
                  Joi.string()
                    .trim()
                    .min(2)
                    .max(180)
                    .required(),

                taskType:
                  Joi.string()
                    .valid(
                      "search",
                      "export",
                      "rectify",
                      "delete",
                      "anonymise",
                      "restrict",
                      "review"
                    )
                    .required(),

                sourceReference:
                  Joi.string()
                    .trim()
                    .max(255)
                    .optional(),

                assignedTo:
                  Joi.string()
                    .uuid()
                    .optional(),
              })
            )
            .max(100)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  updateDataSubjectRequest: {
    params:
      Joi.object({
        requestId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "identity_verification",
              "in_review",
              "approved",
              "rejected",
              "processing",
              "completed",
              "cancelled",
              "overdue"
            )
            .required(),

        rejectionReason:
          Joi.string()
            .max(5000)
            .optional(),
      }),
  },

  createRetentionPolicy: {
    body:
      Joi.object({
        policyCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        policyName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        dataCategory:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        sourceSystem:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        sourceTable:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        retentionPeriodDays:
          Joi.number()
            .integer()
            .min(1)
            .max(36500)
            .required(),

        dispositionAction:
          Joi.string()
            .valid(
              "delete",
              "anonymise",
              "archive",
              "review"
            )
            .required(),

        triggerEvent:
          Joi.string()
            .valid(
              "record_created",
              "account_closed",
              "relationship_ended",
              "transaction_completed",
              "consent_withdrawn",
              "custom"
            )
            .required(),

        triggerField:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        legalBasis:
          Joi.string()
            .max(1000)
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "inactive",
              "retired"
            )
            .default("draft"),
      }),
  },

  uuidParam: {
    params:
      Joi.object({
        policyId:
          Joi.string()
            .uuid()
            .optional(),

        runId:
          Joi.string()
            .uuid()
            .optional(),

        holdId:
          Joi.string()
            .uuid()
            .optional(),
      }).min(1),
  },

  createLegalHold: {
    body:
      Joi.object({
        name:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        reason:
          Joi.string()
            .min(2)
            .max(10000)
            .required(),

        scopeType:
          Joi.string()
            .valid(
              "user",
              "account",
              "transaction",
              "case",
              "table",
              "custom"
            )
            .required(),

        scopeReference:
          Joi.string()
            .trim()
            .min(1)
            .max(500)
            .required(),

        effectiveAt:
          Joi.date()
            .iso()
            .required(),
      }),
  },

  createIncident: {
    body:
      Joi.object({
        title:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        description:
          Joi.string()
            .min(2)
            .max(10000)
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

        incidentType:
          Joi.string()
            .valid(
              "unauthorised_access",
              "data_loss",
              "data_disclosure",
              "malware",
              "misdelivery",
              "insider",
              "third_party",
              "other"
            )
            .required(),

        affectedRecordCount:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        affectedUserCount:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        dataCategories:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(2)
                .max(180)
            )
            .max(100)
            .optional(),

        discoveredAt:
          Joi.date()
            .iso()
            .required(),

        regulatorNotificationRequired:
          Joi.boolean()
            .default(false),

        customerNotificationRequired:
          Joi.boolean()
            .default(false),

        ownerUserId:
          Joi.string()
            .uuid()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },
};
