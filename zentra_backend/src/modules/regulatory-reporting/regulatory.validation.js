const Joi =
  require("joi");

module.exports = {
  createAuthority: {
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
            .max(255)
            .required(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        submissionChannel:
          Joi.string()
            .valid(
              "portal",
              "sftp",
              "api",
              "email",
              "manual"
            )
            .default("manual"),

        endpointUrl:
          Joi.string()
            .uri()
            .max(1000)
            .optional(),

        publicKey:
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

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createDefinition: {
    body:
      Joi.object({
        authorityId:
          Joi.string()
            .uuid()
            .required(),

        reportCode:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        reportName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        reportType:
          Joi.string()
            .valid(
              "prudential",
              "aml",
              "transactions",
              "capital",
              "liquidity",
              "customer_protection",
              "tax",
              "statistical",
              "other"
            )
            .required(),

        frequency:
          Joi.string()
            .valid(
              "daily",
              "weekly",
              "monthly",
              "quarterly",
              "semiannual",
              "annual",
              "adhoc"
            )
            .required(),

        submissionDeadlineDays:
          Joi.number()
            .integer()
            .min(0)
            .max(365)
            .default(0),

        timezone:
          Joi.string()
            .trim()
            .max(120)
            .default("UTC"),

        outputFormat:
          Joi.string()
            .valid(
              "json",
              "csv",
              "xml",
              "xlsx",
              "pdf",
              "xbrl"
            )
            .default("csv"),

        dataQueryKey:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        validationSchema:
          Joi.object()
            .unknown(true)
            .optional(),

        version:
          Joi.string()
            .trim()
            .max(80)
            .default("1.0"),

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

        retentionYears:
          Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(7),

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

  createRun: {
    body:
      Joi.object({
        reportDefinitionId:
          Joi.string()
            .uuid()
            .required(),

        reportingPeriodStart:
          Joi.date()
            .iso()
            .required(),

        reportingPeriodEnd:
          Joi.date()
            .iso()
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  runId: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  uploadRecords: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        records:
          Joi.array()
            .items(
              Joi.object({
                recordKey:
                  Joi.string()
                    .trim()
                    .min(1)
                    .max(255)
                    .required(),

                recordType:
                  Joi.string()
                    .trim()
                    .max(120)
                    .optional(),

                sourceTable:
                  Joi.string()
                    .trim()
                    .max(180)
                    .optional(),

                sourceRecordId:
                  Joi.string()
                    .trim()
                    .max(180)
                    .optional(),

                payload:
                  Joi.object()
                    .unknown(true)
                    .required(),
              })
            )
            .min(1)
            .max(10000)
            .required(),
      }),
  },

  validateRun: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        results:
          Joi.array()
            .items(
              Joi.object({
                recordId:
                  Joi.string()
                    .uuid()
                    .optional(),

                severity:
                  Joi.string()
                    .valid(
                      "info",
                      "warning",
                      "error"
                    )
                    .required(),

                ruleCode:
                  Joi.string()
                    .trim()
                    .min(2)
                    .max(180)
                    .required(),

                fieldPath:
                  Joi.string()
                    .trim()
                    .max(500)
                    .optional(),

                message:
                  Joi.string()
                    .trim()
                    .min(2)
                    .max(2000)
                    .required(),

                actualValue:
                  Joi.any()
                    .optional(),

                expectedValue:
                  Joi.any()
                    .optional(),
              })
            )
            .max(10000)
            .required(),
      }),
  },

  attachGeneratedFile: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        fileKey:
          Joi.string()
            .trim()
            .min(2)
            .max(1000)
            .required(),

        fileHash:
          Joi.string()
            .hex()
            .length(64)
            .optional(),
      }),
  },

  updateSubmission: {
    params:
      Joi.object({
        submissionId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "submitted",
              "accepted",
              "rejected",
              "failed"
            )
            .required(),

        externalReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        responseStatusCode:
          Joi.number()
            .integer()
            .min(100)
            .max(599)
            .optional(),

        responsePayload:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },
};
