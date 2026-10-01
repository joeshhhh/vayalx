// VAYALX Crop Listing Controller (Phase 4)
const cropListingService = require('../services/cropListing.service');
const { asyncHandler } = require('../middleware/error.middleware');

class CropListingController {
  createListing = asyncHandler(async (req, res) => {
    const listing = await cropListingService.createListing(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Crop listing published successfully to marketplace',
      data: listing
    });
  });

  getMarketplaceListings = asyncHandler(async (req, res) => {
    const result = await cropListingService.getMarketplaceListings(req.query);
    res.status(200).json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
  });

  getMyListings = asyncHandler(async (req, res) => {
    const result = await cropListingService.getFarmerListings(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.listings,
      pagination: result.pagination
    });
  });

  getListingById = asyncHandler(async (req, res) => {
    const listing = await cropListingService.getListingById(req.params.id);
    res.status(200).json({
      success: true,
      data: listing
    });
  });

  updateListing = asyncHandler(async (req, res) => {
    const listing = await cropListingService.updateListing(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Crop listing updated successfully',
      data: listing
    });
  });

  deleteListing = asyncHandler(async (req, res) => {
    const result = await cropListingService.deleteListing(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  });
}

module.exports = new CropListingController();
