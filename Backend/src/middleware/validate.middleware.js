const ApiError = require("../utils/ApiError");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      req[property],
      {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      }
    );

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      const validationError = ApiError.validation(
        "Validation failed"
      );

      validationError.details = details;

      return next(validationError);
    }

    req[property] = value;

    return next();
  };
};

module.exports = validate;