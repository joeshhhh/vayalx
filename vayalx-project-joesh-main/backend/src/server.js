// VAYALX Production HTTP Server Bootstrap
const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function startServer() {
  // 1. Initialize MongoDB Connection
  await connectDatabase();

  // 2. Start HTTP Server
  server = app.listen(env.PORT, () => {
    logger.info(`================================================`);
    logger.info(`🌱 VAYALX Backend Server (Phase 1 Foundation)`);
    logger.info(`📡 Environment:  ${env.NODE_ENV}`);
    logger.info(`🌐 Listening on: http://localhost:${env.PORT}`);
    logger.info(`🏥 Health Check: http://localhost:${env.PORT}/api/health`);
    logger.info(`🔒 Allowed CORS: ${env.CLIENT_URL}`);
    logger.info(`================================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED PROMISE REJECTION! Shutting down...', err);
    gracefulShutdown('unhandledRejection');
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    gracefulShutdown('uncaughtException');
  });

  // Handle Termination Signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      process.exit(signal === 'SIGINT' || signal === 'SIGTERM' ? 0 : 1);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force close if stuck
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

startServer();
