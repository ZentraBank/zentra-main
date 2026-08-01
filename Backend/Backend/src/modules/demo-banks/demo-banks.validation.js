const Joi=require("joi");
module.exports={resolveSchema:{body:Joi.object({bankCode:Joi.string().trim().uppercase().max(50).required(),accountNumber:Joi.string().trim().pattern(/^\d{8,20}$/).required()})}};
