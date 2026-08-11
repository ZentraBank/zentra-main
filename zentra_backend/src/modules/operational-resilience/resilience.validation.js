const Joi =
  require("joi");

module.exports = {
  createCriticalService: {
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

        serviceOwnerUserId:
          Joi.string()
            .uuid()
            .required(),

        executiveOwnerUserId:
          Joi.string()
            .uuid()
            .optional(),

        criticality:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .required(),

        customerImpactDescription:
          Joi.string()
            .max(10000)
            .optional(),

        regulatoryImpactDescription:
          Joi.string()
            .max(10000)
            .optional(),

        impactToleranceMinutes:
          Joi.number()
            .integer()
            .min(1)
            .max(525600)
            .required(),

        recoveryTimeObjectiveMinutes:
          Joi.number()
            .integer()
            .min(1)
            .max(525600)
            .required(),

        recoveryPointObjectiveMinutes:
          Joi.number()
            .integer()
            .min(0)
            .max(525600)
            .required(),

        minimumServiceLevelPercentage:
          Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "suspended",
              "retired"
            )
            .default("draft"),

        nextReviewDueAt:
          Joi.date()
            .iso()
            .optional(),
      }),
  },

  serviceId: {
    params:
      Joi.object({
        serviceId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  createDependency: {
    params:
      Joi.object({
        serviceId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        dependencyType:
          Joi.string()
            .valid(
              "application",
              "database",
              "infrastructure",
              "network",
              "cloud_provider",
              "third_party",
              "people",
              "facility",
              "payment_rail",
              "other"
            )
            .required(),

        dependencyName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        dependencyReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        internalOwnerUserId:
          Joi.string()
            .uuid()
            .optional(),

        thirdPartyId:
          Joi.string()
            .uuid()
            .optional(),

        criticality:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .required(),

        maximumTolerableDowntimeMinutes:
          Joi.number()
            .integer()
            .min(0)
            .max(525600)
            .optional(),

        recoveryStrategy:
          Joi.string()
            .max(10000)
            .optional(),

        singlePointOfFailure:
          Joi.boolean()
            .default(false),

        alternateAvailable:
          Joi.boolean()
            .default(false),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive"
            )
            .default("active"),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
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
            .max(20000)
            .required(),

        incidentType:
          Joi.string()
            .valid(
              "technology",
              "cybersecurity",
              "third_party",
              "payment_processing",
              "data",
              "fraud",
              "facility",
              "people",
              "compliance",
              "other"
            )
            .required(),

        severity:
          Joi.string()
            .valid(
              "sev4",
              "sev3",
              "sev2",
              "sev1"
            )
            .required(),

        status:
          Joi.string()
            .valid(
              "detected",
              "triaged"
            )
            .default("detected"),

        detectedAt:
          Joi.date()
            .iso()
            .required(),

        startedAt:
          Joi.date()
            .iso()
            .optional(),

        incidentCommanderUserId:
          Joi.string()
            .uuid()
            .optional(),

        technicalLeadUserId:
          Joi.string()
            .uuid()
            .optional(),

        communicationsLeadUserId:
          Joi.string()
            .uuid()
            .optional(),

        customerImpact:
          Joi.boolean()
            .default(false),

        regulatoryImpact:
          Joi.boolean()
            .default(false),

        financialImpactAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        financialImpactCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        affectedCustomerCount:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        affectedTransactionCount:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        regulatorNotificationRequired:
          Joi.boolean()
            .default(false),

        customerNotificationRequired:
          Joi.boolean()
            .default(false),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  updateIncidentStatus: {
    params:
      Joi.object({
        incidentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "triaged",
              "investigating",
              "mitigating",
              "monitoring",
              "resolved",
              "closed"
            )
            .required(),

        rootCauseCategory:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        rootCauseSummary:
          Joi.string()
            .max(10000)
            .optional(),
      }),
  },

  addAffectedService: {
    params:
      Joi.object({
        incidentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        criticalBusinessServiceId:
          Joi.string()
            .uuid()
            .required(),

        impactStartedAt:
          Joi.date()
            .iso()
            .optional(),

        impactEndedAt:
          Joi.date()
            .iso()
            .optional(),

        impactDescription:
          Joi.string()
            .max(10000)
            .optional(),

        serviceLevelPercentage:
          Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .optional(),

        toleranceBreached:
          Joi.boolean()
            .default(false),

        breachMinutes:
          Joi.number()
            .integer()
            .min(0)
            .optional(),
      }),
  },

  createIncidentAction: {
    params:
      Joi.object({
        incidentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        actionType:
          Joi.string()
            .valid(
              "investigation",
              "containment",
              "mitigation",
              "recovery",
              "communication",
              "regulatory",
              "customer_support",
              "follow_up"
            )
            .required(),

        title:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        description:
          Joi.string()
            .max(10000)
            .optional(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "critical"
            )
            .default("medium"),

        status:
          Joi.string()
            .valid(
              "open",
              "in_progress",
              "blocked",
              "completed",
              "cancelled"
            )
            .default("open"),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        dueAt:
          Joi.date()
            .iso()
            .optional(),

        evidenceStorageKey:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),
      }),
  },

  updateIncidentActionStatus: {
    params:
      Joi.object({
        actionId:
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
              "in_progress",
              "blocked",
              "completed",
              "cancelled"
            )
            .required(),
      }),
  },

  createContinuityPlan: {
    params:
      Joi.object({
        serviceId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        planCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        planName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        version:
          Joi.string()
            .trim()
            .min(1)
            .max(80)
            .required(),

        activationCriteria:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        recoveryStrategy:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        communicationPlan:
          Joi.string()
            .max(20000)
            .optional(),

        alternateSiteDetails:
          Joi.string()
            .max(20000)
            .optional(),

        manualWorkaroundDetails:
          Joi.string()
            .max(20000)
            .optional(),

        restorationSequence:
          Joi.array()
            .items(
              Joi.object()
                .unknown(true)
            )
            .max(1000)
            .optional(),

        status:
          Joi.string()
            .valid(
              "draft",
              "active",
              "superseded",
              "retired"
            )
            .default("draft"),

        effectiveFrom:
          Joi.date()
            .iso()
            .required(),

        effectiveTo:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "effectiveFrom"
              )
            )
            .optional(),
      }),
  },

  createExercise: {
    body:
      Joi.object({
        exerciseName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        exerciseType:
          Joi.string()
            .valid(
              "tabletop",
              "simulation",
              "failover",
              "disaster_recovery",
              "cyber_recovery",
              "third_party_exit",
              "communications",
              "full_scale"
            )
            .required(),

        scope:
          Joi.object()
            .unknown(true)
            .required(),

        scenario:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        plannedStartAt:
          Joi.date()
            .iso()
            .required(),

        plannedEndAt:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "plannedStartAt"
              )
            )
            .required(),

        status:
          Joi.string()
            .valid(
              "planned",
              "approved"
            )
            .default("planned"),
      }),
  },

  completeExercise: {
    params:
      Joi.object({
        exerciseId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        outcome:
          Joi.string()
            .valid(
              "passed",
              "passed_with_actions",
              "failed"
            )
            .required(),

        actualStartAt:
          Joi.date()
            .iso()
            .optional(),

        actualEndAt:
          Joi.date()
            .iso()
            .required(),

        summary:
          Joi.string()
            .max(20000)
            .optional(),

        lessonsLearned:
          Joi.string()
            .max(20000)
            .optional(),
      }),
  },

  createPostIncidentReview: {
    params:
      Joi.object({
        incidentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        executiveSummary:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        timeline:
          Joi.array()
            .items(
              Joi.object()
                .unknown(true)
            )
            .min(1)
            .max(5000)
            .required(),

        rootCause:
          Joi.string()
            .min(2)
            .max(20000)
            .required(),

        contributingFactors:
          Joi.array()
            .items(
              Joi.string()
                .max(2000)
            )
            .max(500)
            .optional(),

        whatWentWell:
          Joi.array()
            .items(
              Joi.string()
                .max(2000)
            )
            .max(500)
            .optional(),

        whatWentWrong:
          Joi.array()
            .items(
              Joi.string()
                .max(2000)
            )
            .max(500)
            .optional(),

        customerImpactAssessment:
          Joi.string()
            .max(20000)
            .optional(),

        regulatoryImpactAssessment:
          Joi.string()
            .max(20000)
            .optional(),
      }),
  },
};
