const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vayalx',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'vayalx_cookie_secret_dev_phase1',
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'vayalx_token',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  AI_MODE: process.env.AI_MODE || (process.env.GEMINI_API_KEY ? 'LIVE' : 'DEMO'),
  AI_REQUEST_TIMEOUT_MS: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '25000', 10),
  AI_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  AI_RATE_LIMIT_MAX: 30,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

// Validate required environment settings
if (!env.JWT_SECRET) {
  console.error('❌ [VAYALX Fatal Error]: JWT_SECRET is required but not defined in environment variables.');
  process.exit(1);
}
// Validate required environment settings
if (!env.MONGODB_URI) {
  console.warn('⚠️ [VAYALX Config Warning]: MONGODB_URI is not set. Using default local instance.');
}

module.exports = Object.freeze(env);
