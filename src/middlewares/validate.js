const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const payload = {
      ...req.query,
      ...req.params,
      ...req.body,
    };

    const { error } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiError(400, message));
    }

    next();
  };
};

module.exports = validate;
