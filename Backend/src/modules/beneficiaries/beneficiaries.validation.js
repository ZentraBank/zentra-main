const Joi = require("joi");

module.exports = {
  create:{body:Joi.object({
    beneficiaryType:Joi.string().valid("internal","external").required(),
    displayName:Joi.string().trim().min(2).max(120).optional(),
    accountName:Joi.when("beneficiaryType",{is:"external",then:Joi.string().trim().min(2).max(160).required(),otherwise:Joi.any().strip()}),
    accountNumber:Joi.string().trim().pattern(/^\d{8,20}$/).required(),
    bankName:Joi.when("beneficiaryType",{is:"external",then:Joi.string().trim().min(2).max(160).required(),otherwise:Joi.any().strip()}),
    bankCode:Joi.when("beneficiaryType",{is:"external",then:Joi.string().trim().min(2).max(40).required(),otherwise:Joi.any().strip()}),
    currency:Joi.when("beneficiaryType",{is:"external",then:Joi.string().trim().uppercase().length(3).required(),otherwise:Joi.any().strip()})
  })},
  list:{query:Joi.object({
    page:Joi.number().integer().min(1).default(1),
    pageSize:Joi.number().integer().min(1).max(100).default(20),
    search:Joi.string().trim().max(120).allow("").optional(),
    favouritesOnly:Joi.boolean().default(false)
  })},
  id:{params:Joi.object({beneficiaryId:Joi.string().uuid().required()})},
  update:{
    params:Joi.object({beneficiaryId:Joi.string().uuid().required()}),
    body:Joi.object({
      displayName:Joi.string().trim().min(2).max(120).optional(),
      isFavourite:Joi.boolean().optional()
    }).min(1)
  }
};
