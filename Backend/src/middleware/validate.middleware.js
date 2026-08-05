const ApiError = require("../utils/ApiError");

const validateOne = (schema, value) =>
  schema.validate(value, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const targets =
      schema &&
      (schema.body || schema.query || schema.params)
        ? ["body", "query", "params"].filter(
            (key) => schema[key],
          )
        : [property];

    for (const target of targets) {
      const currentSchema =
        schema[target] || schema;

      const currentValue = req[target];

      const { error, value } = validateOne(
        currentSchema,
        currentValue,
      );

      if (error) {
        const details = error.details.map(
          (detail) => ({
            field:
              detail.path.join(".") || target,
            message: detail.message.replace(
              /"/g,
              "",
            ),
            type: detail.type,
          }),
        );

        console.log("VALIDATION FAILED:", {
          target,
          receivedValue: currentValue,
          details,
        });

        return next(
          ApiError.validation(
            "Validation failed",
            details,
          ),
        );
      }

      req[target] = value;
    }

    return next();
  };

module.exports = validate;