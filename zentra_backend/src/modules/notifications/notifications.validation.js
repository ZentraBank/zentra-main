const Joi = require("joi");

module.exports = {
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
