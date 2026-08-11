const Joi =
  require("joi");

module.exports = {
  createThirdParty: {
    body:
      Joi.object({
        thirdPartyCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        legalName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        tradingName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        thirdPartyType:
          Joi.string()
            .valid(
              "technology_vendor",
              "cloud_provider",
              "payment_processor",
              "banking_partner",
              "data_provider",
              "professional_services",
              "outsourcer",
              "affiliate",
              "other"
            )
            .required(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        registrationNumber:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        taxIdentifier:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        primaryContactName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        primaryContactEmail:
          Joi.string()
            .email()
            .max(255)
            .optional(),

        primaryContactPhone:
          Joi.string()
            .trim()
            .max(80)
            .optional(),

        status:
          Joi.string()
            .valid(
              "prospective",
              "due_diligence"
            )
            .default("prospective"),

        criticality:
          Joi.string()
            .valid(
              "non_critical",
              "important",
              "critical"
            )
            .default("non_critical"),

        serviceOwnerUserId:
          Joi.string()
            .uuid()
            .required(),

        riskOwnerUserId:
          Joi.string()
            .uuid()
            .optional(),

        startDate:
          Joi.date()
            .iso()
            .optional(),

        endDate:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  updateThirdPartyStatus: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "due_diligence",
              "approved",
              "active",
              "suspended",
              "offboarding",
              "terminated",
              "rejected"
            )
            .required(),
      }),
  },

  createService: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        serviceCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        serviceName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        description:
          Joi.string()
            .max(10000)
            .optional(),

        serviceCategory:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        supportsCriticalBusinessService:
          Joi.boolean()
            .default(false),

        criticalBusinessServiceId:
          Joi.string()
            .uuid()
            .optional(),

        dataAccessLevel:
          Joi.string()
            .valid(
              "none",
              "public",
              "internal",
              "confidential",
              "restricted"
            )
            .default("none"),

        personalDataProcessed:
          Joi.boolean()
            .default(false),

        paymentDataProcessed:
          Joi.boolean()
            .default(false),

        serviceLocations:
          Joi.array()
            .items(
              Joi.object()
                .unknown(true)
            )
            .max(100)
            .optional(),

        subcontractingAllowed:
          Joi.boolean()
            .default(false),

        status:
          Joi.string()
            .valid(
              "planned",
              "active",
              "suspended",
              "terminated"
            )
            .default("planned"),
      }),
  },

  createDueDiligence: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        assessmentType:
          Joi.string()
            .valid(
              "initial",
              "periodic",
              "event_driven",
              "renewal",
              "exit"
            )
            .required(),

        scope:
          Joi.object()
            .unknown(true)
            .required(),

        status:
          Joi.string()
            .valid(
              "draft",
              "in_progress",
              "awaiting_evidence"
            )
            .default("draft"),

        expiresAt:
          Joi.date()
            .iso()
            .greater("now")
            .optional(),
      }),
  },

  completeDueDiligence: {
    params:
      Joi.object({
        assessmentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        inherentRiskScore:
          Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .required(),

        controlEffectivenessScore:
          Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .required(),

        residualRiskScore:
          Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .required(),

        riskRating:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .required(),

        summary:
          Joi.string()
            .max(20000)
            .optional(),
      }),
  },

  reviewDueDiligence: {
    params:
      Joi.object({
        assessmentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        decision:
          Joi.string()
            .valid(
              "approve",
              "reject"
            )
            .required(),

        rejectionReason:
          Joi.when(
            "decision",
            {
              is: "reject",
              then:
                Joi.string()
                  .min(2)
                  .max(10000)
                  .required(),
              otherwise:
                Joi.string()
                  .max(10000)
                  .optional(),
            }
          ),
      }),
  },

  createContract: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        contractReference:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        contractName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        contractType:
          Joi.string()
            .valid(
              "master_services",
              "statement_of_work",
              "data_processing",
              "outsourcing",
              "licence",
              "support",
              "other"
            )
            .required(),

        effectiveFrom:
          Joi.date()
            .iso()
            .required(),

        effectiveTo:
          Joi.date()
            .iso()
            .optional(),

        renewalDate:
          Joi.date()
            .iso()
            .optional(),

        autoRenew:
          Joi.boolean()
            .default(false),

        noticePeriodDays:
          Joi.number()
            .integer()
            .min(0)
            .max(3650)
            .optional(),

        totalContractValue:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        governingLaw:
          Joi.string()
            .max(255)
            .optional(),

        terminationRights:
          Joi.string()
            .max(20000)
            .optional(),

        auditRights:
          Joi.string()
            .max(20000)
            .optional(),

        dataReturnDeletionTerms:
          Joi.string()
            .max(20000)
            .optional(),

        businessContinuityRequirements:
          Joi.string()
            .max(20000)
            .optional(),

        contractStorageKey:
          Joi.string()
            .max(1000)
            .optional(),

        contractHash:
          Joi.string()
            .hex()
            .length(64)
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "expired",
              "terminated",
              "superseded"
            )
            .default("draft"),

        ownerUserId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  createSla: {
    params:
      Joi.object({
        serviceId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        slaCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        metricName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        metricType:
          Joi.string()
            .valid(
              "availability",
              "latency",
              "recovery_time",
              "recovery_point",
              "support_response",
              "incident_notification",
              "processing_accuracy",
              "other"
            )
            .required(),

        targetValue:
          Joi.number()
            .precision(4)
            .required(),

        comparisonOperator:
          Joi.string()
            .valid(
              "gte",
              "lte",
              "eq"
            )
            .required(),

        unit:
          Joi.string()
            .trim()
            .min(1)
            .max(80)
            .required(),

        measurementWindow:
          Joi.string()
            .trim()
            .min(1)
            .max(120)
            .required(),

        breachSeverity:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .default("medium"),

        serviceCreditTerms:
          Joi.string()
            .max(10000)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive"
            )
            .default("active"),
      }),
  },

  recordSlaMeasurement: {
    params:
      Joi.object({
        slaId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        periodStart:
          Joi.date()
            .iso()
            .required(),

        periodEnd:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "periodStart"
              )
            )
            .required(),

        measuredValue:
          Joi.number()
            .precision(4)
            .required(),

        breachMinutes:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        evidenceStorageKey:
          Joi.string()
            .max(1000)
            .optional(),
      }),
  },

  createRiskIssue: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        dueDiligenceId:
          Joi.string()
            .uuid()
            .optional(),

        title:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        description:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        category:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
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

        status:
          Joi.string()
            .valid(
              "open",
              "accepted",
              "mitigating"
            )
            .default("open"),

        remediationPlan:
          Joi.string()
            .max(20000)
            .optional(),

        ownerUserId:
          Joi.string()
            .uuid()
            .optional(),

        dueAt:
          Joi.date()
            .iso()
            .optional(),

        riskAcceptanceReference:
          Joi.string()
            .max(255)
            .optional(),

        evidenceStorageKey:
          Joi.string()
            .max(1000)
            .optional(),
      }),
  },

  createExitPlan: {
    params:
      Joi.object({
        thirdPartyId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        planName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        exitTriggers:
          Joi.array()
            .items(
              Joi.string()
                .min(2)
                .max(2000)
            )
            .min(1)
            .max(100)
            .required(),

        replacementStrategy:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        transitionSteps:
          Joi.array()
            .items(
              Joi.object()
                .unknown(true)
            )
            .min(1)
            .max(1000)
            .required(),

        dataReturnStrategy:
          Joi.string()
            .max(20000)
            .optional(),

        dataDeletionVerification:
          Joi.string()
            .max(20000)
            .optional(),

        continuityArrangements:
          Joi.string()
            .max(20000)
            .optional(),

        estimatedExitDays:
          Joi.number()
            .integer()
            .min(1)
            .max(3650)
            .optional(),

        estimatedExitCost:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        nextTestDueAt:
          Joi.date()
            .iso()
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "tested",
              "invoked"
            )
            .default("draft"),
      }),
  },
};
