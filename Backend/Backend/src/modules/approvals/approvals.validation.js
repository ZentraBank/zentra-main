const Joi =
  require("joi");

module.exports = {
  createPolicy: {
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

        actionType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        minimumAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        maximumAmount:
          Joi.number()
            .min(
              Joi.ref(
                "minimumAmount"
              )
            )
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        requiredApprovals:
          Joi.number()
            .integer()
            .min(1)
            .max(10)
            .default(1),

        requireDistinctRoles:
          Joi.boolean()
            .default(false),

        prohibitSelfApproval:
          Joi.boolean()
            .default(true),

        allowedRoleIds:
          Joi.array()
            .items(
              Joi.string().uuid()
            )
            .unique()
            .optional(),

        allowedPermissionCodes:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .max(160)
            )
            .unique()
            .optional(),

        expiresAfterMinutes:
          Joi.number()
            .integer()
            .min(1)
            .max(43200)
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

  listPolicies: {
    query:
      Joi.object({
        actionType:
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

  updatePolicy: {
    params:
      Joi.object({
        policyId:
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

        minimumAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        maximumAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        requiredApprovals:
          Joi.number()
            .integer()
            .min(1)
            .max(10)
            .optional(),

        requireDistinctRoles:
          Joi.boolean()
            .optional(),

        prohibitSelfApproval:
          Joi.boolean()
            .optional(),

        allowedRoleIds:
          Joi.array()
            .items(
              Joi.string().uuid()
            )
            .unique()
            .optional(),

        allowedPermissionCodes:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .max(160)
            )
            .unique()
            .optional(),

        expiresAfterMinutes:
          Joi.number()
            .integer()
            .min(1)
            .max(43200)
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

  createRequest: {
    body:
      Joi.object({
        actionType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
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
            .required(),

        requestReference:
          Joi.string()
            .trim()
            .min(3)
            .max(160)
            .required(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

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

        payload:
          Joi.object()
            .unknown(true)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  requestId: {
    params:
      Joi.object({
        requestId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  decide: {
    params:
      Joi.object({
        requestId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        decision:
          Joi.string()
            .valid(
              "approved",
              "rejected"
            )
            .required(),

        roleId:
          Joi.string()
            .uuid()
            .optional(),

        comment:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listRequests: {
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
              "pending",
              "approved",
              "rejected",
              "cancelled",
              "expired"
            )
            .optional(),

        actionType:
          Joi.string()
            .trim()
            .max(120)
            .optional(),
      }),
  },
};
