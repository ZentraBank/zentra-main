const Joi = require("joi");
const pin = Joi.string().pattern(/^\d{4}$/).required();
module.exports = { setup: { body: Joi.object({ password: Joi.string().min(8).max(128).required(), pin }) }, change: { body: Joi.object({ currentPin: pin, newPin: pin.invalid(Joi.ref("currentPin")) }) } };
