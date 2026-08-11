const Joi = require("joi");

const createClientSchema = {
  body: Joi.object({
    firstName: Joi.string().trim().min(2).max(100).required(),
    middleName: Joi.string().trim().max(100).allow("", null).optional(),
    lastName: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().lowercase().email().required(),
    phone: Joi.string().trim().max(50).allow("", null).optional(),
    password: Joi.string().min(8).max(128).pattern(/[A-Za-z]/).pattern(/[0-9]/).optional(),
    account: Joi.object({
      accountName: Joi.string().trim().min(2).max(191).optional(),
      accountType: Joi.string().valid("wallet", "savings", "current", "investment").default("savings"),
      currency: Joi.string().trim().uppercase().length(3).default("USD"),
    }).optional(),
  }).required(),
};

const clientIdSchema = {
  params: Joi.object({
    clientId: Joi.string().guid({ version: ["uuidv4"] }).required(),
  }).required(),
};

module.exports = { createClientSchema, clientIdSchema };
