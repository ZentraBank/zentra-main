const Joi = require("joi");

const startConversationSchema = Joi.object({
  subject: Joi.string().max(150).allow("", null),
  message: Joi.string().min(1).max(2000).required(),
});

const sendMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
});

module.exports = {
  startConversationSchema,
  sendMessageSchema,
};