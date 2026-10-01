// VAYALX Health Controller
const HealthService = require('../services/health.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getHealth = asyncHandler(async (req, res) => {
  const healthData = HealthService.getHealthStatus();
  return ApiResponse.success(res, 'VAYALX Backend Service is healthy', healthData, 200);
});

module.exports = {
  getHealth
};
