// VAYALX Dashboard Summary Controller (Phase 4 Real Database KPI Stats)
const dashboardService = require('../services/dashboard.service');
const marketService = require('../services/market.service');
const { asyncHandler } = require('../middleware/error.middleware');

class DashboardController {
  getFarmerDashboard = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getFarmerDashboardSummary(req.user._id);
    res.status(200).json({
      success: true,
      data: summary
    });
  });

  getBuyerDashboard = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getBuyerDashboardSummary(req.user._id);
    res.status(200).json({
      success: true,
      data: summary
    });
  });

  getSupplierDashboard = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSupplierDashboardSummary(req.user._id);
    res.status(200).json({
      success: true,
      data: summary
    });
  });

  getDailyMandiRates = asyncHandler(async (req, res) => {
    const rates = await marketService.getDailyMandiRates(req.query.district);
    res.status(200).json({
      success: true,
      data: rates.data,
      source: rates.source,
      timestamp: rates.timestamp,
      district: rates.district
    });
  });
}

module.exports = new DashboardController();
