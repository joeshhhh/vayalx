// VAYALX Buyer Demand Controller (Phase 4)
const buyerDemandService = require('../services/buyerDemand.service');
const { asyncHandler } = require('../middleware/error.middleware');

class BuyerDemandController {
  createDemand = asyncHandler(async (req, res) => {
    const demand = await buyerDemandService.createDemand(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Procurement demand tender published successfully',
      data: demand
    });
  });

  getMyDemands = asyncHandler(async (req, res) => {
    const result = await buyerDemandService.getMyDemands(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.demands,
      pagination: result.pagination
    });
  });

  getOpenDemands = asyncHandler(async (req, res) => {
    const result = await buyerDemandService.getOpenDemands(req.query);
    res.status(200).json({
      success: true,
      data: result.demands,
      pagination: result.pagination
    });
  });

  cancelDemand = asyncHandler(async (req, res) => {
    const demand = await buyerDemandService.cancelDemand(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Procurement demand cancelled successfully',
      data: demand
    });
  });
}

module.exports = new BuyerDemandController();
