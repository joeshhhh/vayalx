// VAYALX Express Application Setup
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const { helmetMiddleware, corsMiddleware, mongoSanitizeMiddleware } = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const routes = require('./routes');

const app = express();

// 1. Security Headers & CORS
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 2. Request Logging
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. Rate Limiting (Applied globally to all /api endpoints)
app.use('/api', apiLimiter);

// 4. Request Body Parsing & Limits (10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Cookie Parser
app.use(cookieParser(env.COOKIE_SECRET));

// 6. MongoDB Query Operator Injection Sanitization
app.use(mongoSanitizeMiddleware);

// 7. Mount API Routes
app.use('/api', routes);

// 8. Handle 404 Not Found
app.use(notFoundMiddleware);

// 9. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
