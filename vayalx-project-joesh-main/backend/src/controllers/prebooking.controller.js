// VAYALX Prebooking Controller (Phase 4)
const prebookingService = require('../services/prebooking.service');
const { asyncHandler } = require('../middleware/error.middleware');

class PrebookingController {
  createPrebooking = asyncHandler(async (req, res) => {
    const prebooking = await prebookingService.createPrebooking(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Advance harvest pre-booking token generated successfully',
      data: prebooking
    });
  });

  getMyPrebookings = asyncHandler(async (req, res) => {
    const result = await prebookingService.getFarmerPrebookings(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.prebookings,
      pagination: result.pagination
    });
  });

  cancelPrebooking = asyncHandler(async (req, res) => {
    const prebooking = await prebookingService.cancelPrebooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Pre-booking token cancelled successfully',
      data: prebooking
    });
  });
}

module.exports = new PrebookingController();
