// VAYALX Centralized Error Handling Middleware
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

function handleCastErrorDB(err) {
  const message = `Invalid resource identifier: '${err.value}' for field '${err.path}'`;
  return { statusCode: 400, message };
}

function handleDuplicateFieldsDB(err) {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return { statusCode: 400, message };
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Validation error: ${errors.join('. ')}`;
  return { statusCode: 400, message, errors };
}

function handleJWTError() {
  return { statusCode: 401, message: 'Invalid authentication token. Please log in again.' };
}

function handleJWTExpiredError() {
  return { statusCode: 401, message: 'Your session has expired. Please log in again.' };
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Mongoose & JWT specific error handling
  if (err.name === 'CastError') {
    const custom = handleCastErrorDB(err);
    statusCode = custom.statusCode;
    message = custom.message;
  } else if (err.code === 11000) {
    const custom = handleDuplicateFieldsDB(err);
    statusCode = custom.statusCode;
    message = custom.message;
  } else if (err.name === 'ValidationError') {
    const custom = handleValidationErrorDB(err);
    statusCode = custom.statusCode;
    message = custom.message;
    errors = custom.errors;
  } else if (err.name === 'JsonWebTokenError') {
    const custom = handleJWTError();
    statusCode = custom.statusCode;
    message = custom.message;
  } else if (err.name === 'TokenExpiredError') {
    const custom = handleJWTExpiredError();
    statusCode = custom.statusCode;
    message = custom.message;
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  // Server-side logging
  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[Client Operational Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

// Safe client response (no internal stack traces exposed)
  return ApiResponse.error(res, message, statusCode, errors);
}

const asyncHandler = require('../utils/asyncHandler');

module.exports = errorHandler;
module.exports.errorHandler = errorHandler;
module.exports.asyncHandler = asyncHandler;

