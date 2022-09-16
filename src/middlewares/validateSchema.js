const ExpressError = require("../utils/ExpressError");

function validateSchema(validationSchema) {
  return function (req, res, next) {
    const { error } = validationSchema.validate(req.body);
    if (error) {
      throw new ExpressError(error, 400);
    }
    next();
  };
}

module.exports = validateSchema;
