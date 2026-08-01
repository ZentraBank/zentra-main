const Joi =
  require("joi");

const scope =
  Joi.string()
    .trim()
    .min(3)
    .max(180);

module.exports = {
  createPartnerApplication: {
    body:
      Joi.object({
        partnerName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        applicationName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        applicationType:
          Joi.string()
            .valid(
              "open_banking",
              "merchant",
              "fintech",
              "internal",
              "regulatory",
              "other"
            )
            .required(),

        publicKey:
          Joi.string()
            .max(10000)
            .optional(),

        jwksUri:
          Joi.string()
            .uri({
              scheme: [
                "https",
              ],
            })
            .max(1000)
            .optional(),

        redirectUris:
          Joi.array()
            .items(
              Joi.string()
                .uri()
                .max(1000)
            )
            .max(20)
            .optional(),

        environment:
          Joi.string()
            .valid(
              "sandbox",
              "production"
            )
            .default("sandbox"),

        status:
          Joi.string()
            .valid(
              "pending",
              "active"
            )
            .default("pending"),

        contactName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        contactEmail:
          Joi.string()
            .email()
            .max(255)
            .optional(),

        ipAllowlist:
          Joi.array()
            .items(
              Joi.string()
                .ip({
                  version: [
                    "ipv4",
                    "ipv6",
                    "ipvfuture",
                  ],
                  cidr: "optional",
                })
            )
            .max(100)
            .optional(),

        scopes:
          Joi.array()
            .items(scope)
            .min(1)
            .max(100)
            .unique()
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  partnerId: {
    params:
      Joi.object({
        partnerId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  issueToken: {
    body:
      Joi.object({
        clientId:
          Joi.string()
            .trim()
            .min(12)
            .max(180)
            .required(),

        clientSecret:
          Joi.string()
            .min(32)
            .max(500)
            .required(),

        scopes:
          Joi.array()
            .items(scope)
            .max(100)
            .unique()
            .optional(),

        expiresInSeconds:
          Joi.number()
            .integer()
            .min(60)
            .max(86400)
            .default(3600),
      }),
  },

  createConsent: {
    params:
      Joi.object({
        partnerId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        consentType:
          Joi.string()
            .valid(
              "account_information",
              "payment_initiation",
              "funds_confirmation",
              "transaction_history",
              "standing_orders",
              "direct_debits"
            )
            .required(),

        scopes:
          Joi.array()
            .items(scope)
            .min(1)
            .max(100)
            .unique()
            .required(),

        accountIds:
          Joi.array()
            .items(
              Joi.string()
                .uuid()
            )
            .max(100)
            .optional(),

        expiresAt:
          Joi.date()
            .iso()
            .greater("now")
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  authoriseConsent: {
    params:
      Joi.object({
        consentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        scaReference:
          Joi.string()
            .trim()
            .min(6)
            .max(255)
            .required(),
      }),
  },

  revokeConsent: {
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

  createWebhookSubscription: {
    params:
      Joi.object({
        partnerId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        endpointUrl:
          Joi.string()
            .uri({
              scheme: ["https"],
            })
            .max(1000)
            .required(),

        eventTypes:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(3)
                .max(180)
            )
            .min(1)
            .max(100)
            .unique()
            .required(),

        signingAlgorithm:
          Joi.string()
            .valid(
              "HMAC-SHA256",
              "RSA-SHA256"
            )
            .default(
              "HMAC-SHA256"
            ),

        status:
          Joi.string()
            .valid(
              "active",
              "paused"
            )
            .default("active"),

        maxAttempts:
          Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10),

        timeoutSeconds:
          Joi.number()
            .integer()
            .min(1)
            .max(120)
            .default(10),
      }),
  },

  createRateLimitPolicy: {
    body:
      Joi.object({
        policyCode:
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

        partnerApplicationId:
          Joi.string()
            .uuid()
            .optional(),

        routePattern:
          Joi.string()
            .trim()
            .max(500)
            .optional(),

        requestsPerWindow:
          Joi.number()
            .integer()
            .min(1)
            .max(1000000)
            .required(),

        windowSeconds:
          Joi.number()
            .integer()
            .min(1)
            .max(86400)
            .required(),

        burstLimit:
          Joi.number()
            .integer()
            .min(1)
            .max(1000000)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive"
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
};
