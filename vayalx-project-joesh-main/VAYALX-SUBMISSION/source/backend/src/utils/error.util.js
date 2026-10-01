// VAYALX Error Utility Helper
const AppError = require('./appError');

class ValidationError extends AppError {
  constructor(message = 'Validation Error', errors = null) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

class ApiError extends AppError {
  constructor(message = 'Internal API Error', statusCode = 500, errors = null) {
    super(message, statusCode, errors);
    this.name = 'ApiError';
  }
}

function createClientError(message, statusCode = 400, errors = null) {
  return new AppError(message, statusCode, errors);
}

module.exports = {
  AppError,
  ValidationError,
  ApiError,
  createClientError
};
