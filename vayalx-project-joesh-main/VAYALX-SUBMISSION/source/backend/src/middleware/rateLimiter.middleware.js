// VAYALX Rate Limiter Middleware
const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

// Standard API Rate Limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, 'Too many requests from this IP. Please try again after 15 minutes.', 429);
  }
});

// Stricter Rate Limiter for Authentication & Sensitive routes (Phase 2/3)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, 'Too many login attempts. Please try again in 15 minutes.', 429);
  }
});

// AI Rate Limiter for expensive AI/Gemini endpoints (Phase 5)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Limit per authenticated user ID or fallback to client IP
    return (req.user && req.user._id ? req.user._id.toString() : req.ip) || 'anonymous';
  },
  handler: (req, res) => {
    return ApiResponse.error(res, 'Too many diagnosis requests. Please try again later.', 429);
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter
};

