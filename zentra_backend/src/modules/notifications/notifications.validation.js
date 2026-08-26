const Joi =
  require("joi");

const uuid =
  Joi.string().guid({
    version: [
      "uuidv4",
    ],
  });

const templateId = {
  params:
    Joi.object({
      templateId:
        uuid.required(),
    }),
};

const createTemplate = {
  body:
    Joi.object({
      name:
        Joi.string()
          .trim()
          .min(2)
          .max(150)
          .required(),

      category:
        Joi.string()
          .trim()
          .max(100)
          .allow(
            "",
            null
          )
          .optional(),

      title:
        Joi.string()
          .trim()
          .min(2)
          .max(255)
          .required(),

      message:
        Joi.string()
          .trim()
          .min(2)
          .max(5000)
          .required(),

      priority:
        Joi.string()
          .valid(
            "low",
            "normal",
            "high"
          )
          .default(
            "normal"
          ),

      actionUrl:
        Joi.string()
          .trim()
          .max(500)
          .allow(
            "",
            null
          )
          .optional(),

      status:
        Joi.string()
          .valid(
            "active",
            "inactive"
          )
          .default(
            "active"
          ),
    }),
};

const updateTemplate = {
  params:
    Joi.object({
      templateId:
        uuid.required(),
    }),

  body:
    Joi.object({
      name:
        Joi.string()
          .trim()
          .min(2)
          .max(150)
          .optional(),

      category:
        Joi.string()
          .trim()
          .max(100)
          .allow(
            "",
            null
          )
          .optional(),

      title:
        Joi.string()
          .trim()
          .min(2)
          .max(255)
          .optional(),

      message:
        Joi.string()
          .trim()
          .min(2)
          .max(5000)
          .optional(),

      priority:
        Joi.string()
          .valid(
            "low",
            "normal",
            "high"
          )
          .optional(),

      actionUrl:
        Joi.string()
          .trim()
          .max(500)
          .allow(
            "",
            null
          )
          .optional(),

      status:
        Joi.string()
          .valid(
            "active",
            "inactive"
          )
          .optional(),
    })
      .min(1),
};

const listTemplates = {
  query:
    Joi.object({
      status:
        Joi.string()
          .valid(
            "active",
            "inactive",
            "all"
          )
          .optional(),
    }),
};

const sendToClients = {
  body:
    Joi.object({
      audienceType:
        Joi.string()
          .valid(
            "user",
            "users",
            "all_clients"
          )
          .required(),

      userId:
        uuid.when(
          "audienceType",
          {
            is: "user",
            then:
              uuid.required(),
            otherwise:
              Joi.forbidden(),
          }
        ),

      userIds:
        Joi.array()
          .items(
            uuid
          )
          .min(1)
          .max(500)
          .unique()
          .when(
            "audienceType",
            {
              is: "users",
              then:
                Joi.required(),
              otherwise:
                Joi.forbidden(),
            }
          ),

      templateId:
        uuid.optional(),

      title:
        Joi.string()
          .trim()
          .max(255)
          .optional(),

      message:
        Joi.string()
          .trim()
          .max(5000)
          .optional(),

      priority:
        Joi.string()
          .valid(
            "low",
            "normal",
            "high"
          )
          .optional(),

      actionUrl:
        Joi.string()
          .trim()
          .max(500)
          .allow(
            "",
            null
          )
          .optional(),
    })
      .custom(
        (
          value,
          helpers
        ) => {
          if (
            !value.templateId &&
            (
              !value.title ||
              !value.message
            )
          ) {
            return helpers.error(
              "any.custom",
              {
                message:
                  "Provide a templateId or both title and message",
              }
            );
          }

          return value;
        }
      ),
};

module.exports = {
  templateId,
  createTemplate,
  updateTemplate,
  listTemplates,
  sendToClients,
  
  list:{
    query:Joi.object({
      page:Joi.number().integer().min(1).default(1),
      pageSize:Joi.number().integer().min(1).max(100).default(20),
      unreadOnly:Joi.boolean().default(false),
      includeArchived:Joi.boolean().default(false)
    })
  },
  id:{
    params:Joi.object({
      notificationId:Joi.string().uuid().required()
    })
  },
  broadcast:{
    body:Joi.object({
      audienceType:Joi.string().valid("all_users","role","plan").required(),
      audienceValue:Joi.when("audienceType",{
        is:Joi.valid("role","plan"),
        then:Joi.string().trim().min(2).max(120).required(),
        otherwise:Joi.any().strip()
      }),
      title:Joi.string().trim().min(3).max(160).required(),
      message:Joi.string().trim().min(3).max(1000).required(),
      priority:Joi.string().valid("low","normal","high","urgent").default("normal"),
      actionUrl:Joi.string().trim().max(1000).allow("").optional()
    })
  }

  
};
