// VAYALX Safe Logger Utility
const env = require('../config/env');

const SENSITIVE_KEYS = ['password', 'token', 'jwt', 'secret', 'apikey', 'gemini_api_key', 'authorization', 'cookie'];

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(s => lowerKey.includes(s))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const logger = {
  info: (msg, meta = null) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [INFO] [VAYALX]: ${msg}`, JSON.stringify(sanitizeObject(meta)));
    } else {
      console.log(`[${timestamp}] [INFO] [VAYALX]: ${msg}`);
    }
  },
  warn: (msg, meta = null) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] [VAYALX]: ${msg}`, JSON.stringify(sanitizeObject(meta)));
    } else {
      console.warn(`[${timestamp}] [WARN] [VAYALX]: ${msg}`);
    }
  },
  error: (msg, err = null) => {
    const timestamp = new Date().toISOString();
    const safeError = err ? (err.message || String(err)) : '';
    console.error(`[${timestamp}] [ERROR] [VAYALX]: ${msg} ${safeError}`);
    if (err && env.isDevelopment && err.stack) {
      console.error(err.stack);
    }
  }
};

module.exports = logger;
