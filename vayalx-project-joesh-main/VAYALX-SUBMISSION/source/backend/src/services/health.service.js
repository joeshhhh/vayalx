// VAYALX Health Check Service
const mongoose = require('mongoose');
const env = require('../config/env');

class HealthService {
  static getHealthStatus() {
    const isDbConnected = mongoose.connection.readyState === 1;

    return {
      app: 'VAYALX',
      status: 'OK',
      version: '1.0.0 (Phase 7)',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: isDbConnected ? 'connected' : 'disconnected',
        ai: env.GEMINI_API_KEY ? 'configured' : 'demo_mode',
        weather: 'configured',
        market: env.MARKET_MODE === 'LIVE' ? 'configured' : 'demo_mode',
        schemes: env.SCHEMES_MODE === 'LIVE' ? 'configured' : 'demo_mode'
      }
    };
  }
}

module.exports = HealthService;
