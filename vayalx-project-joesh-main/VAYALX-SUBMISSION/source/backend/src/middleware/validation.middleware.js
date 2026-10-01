// VAYALX Validation Result Middleware
const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value !== undefined ? String(err.value).substring(0, 50) : undefined
    }));

    return ApiResponse.error(
      res,
      'Request validation failed',
      400,
      formattedErrors
    );
  }
  next();
}

module.exports = validate;
