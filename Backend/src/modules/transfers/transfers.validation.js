const Joi = require("joi");

module.exports = {
  createTransferSchema: {
    body: Joi.object({
      sourceAccountId: Joi.string().uuid().required(),
      destinationAccountNumber: Joi.string().trim().pattern(/^\d{8,20}$/).required(),
      amount: Joi.number().positive().precision(2).required(),
      currency: Joi.string().trim().uppercase().length(3).default("USD"),
      description: Joi.string().trim().max(255).allow("").optional(),
    }),
  },
  transferIdSchema: {
    params: Joi.object({ transferId: Joi.string().uuid().required() }),
  },
  listTransfersSchema: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
    }),
  },
};
