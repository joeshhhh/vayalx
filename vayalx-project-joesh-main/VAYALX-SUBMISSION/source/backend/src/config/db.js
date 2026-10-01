// VAYALX Database Connection & Lifecycle Manager
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

// Mask credentials if present in connection string for safe logging
function getSafeMongoUri(uri) {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'mongodb://[REDACTED]';
  }
}

async function connectDatabase() {
  if (!env.MONGODB_URI) {
    logger.error('Database connection failed: MONGODB_URI environment variable is missing.');
    return false;
  }

  const safeUri = getSafeMongoUri(env.MONGODB_URI);

  try {
    mongoose.set('strictQuery', true);

    // Event listeners
    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info(`MongoDB connected successfully [${safeUri}]`);
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      logger.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected from server.');
    });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.isDevelopment
    });

    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    logger.warn(`MongoDB initial connection failed (${err.message}). Server running in standby mode.`);
    return false;
  }
}

function getDatabaseStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const stateCode = mongoose.connection.readyState;
  return stateMap[stateCode] || 'unknown';
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed gracefully.');
  }
}

module.exports = {
  connectDatabase,
  getDatabaseStatus,
  disconnectDatabase
};
