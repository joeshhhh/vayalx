// VAYALX Security Middlewares & Sanitizers
const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

// Clean MongoDB operators ($ prefix and . in keys) recursively
function sanitizeMongoOperators(target) {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    return target.map(sanitizeMongoOperators);
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      // Strip forbidden query operator keys
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeMongoOperators(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// MongoDB Query Injection Protection Middleware
function mongoSanitizeMiddleware(req, res, next) {
  if (req.body) req.body = sanitizeMongoOperators(req.body);
  if (req.query) req.query = sanitizeMongoOperators(req.query);
  if (req.params) req.params = sanitizeMongoOperators(req.params);
  next();
}

// Configured Helmet Security Headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Allows flexible integration for hackathon frontend assets
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Configured CORS Options (Restrict to CLIENT_URL or dev localhost)
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || env.isDevelopment) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Access denied for this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
});

module.exports = {
  mongoSanitizeMiddleware,
  helmetMiddleware,
  corsMiddleware,
  sanitizeMongoOperators
};
