// VAYALX 404 Route Not Found Middleware
const AppError = require('../utils/appError');

function notFoundMiddleware(req, res, next) {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
}

module.exports = notFoundMiddleware;
