// VAYALX Crop Listing Service (Phase 4)
const { CropListing } = require('../models');
const { createClientError } = require('../utils/error.util');

class CropListingService {
  /**
   * Create a new crop listing for the authenticated farmer
   */
  async createListing(farmerId, data) {
    const {
      cropName,
      cropCategory,
      variety,
      quantity,
      quantityUnit = 'Kg',
      price,
      priceUnit = '₹/kg',
      location,
      harvestDate,
      availableFrom,
      availableUntil,
      quality,
      description,
      images = []
    } = data;

    if (!cropName || !cropName.trim()) {
      throw createClientError('Crop name is required', 400);
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw createClientError('Quantity must be greater than zero', 400);
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw createClientError('Price cannot be negative', 400);
    }

    if (!location || !location.trim()) {
      throw createClientError('Farm location is required', 400);
    }

    const listing = await CropListing.create({
      farmer: farmerId,
      cropName: cropName.trim(),
      cropCategory: cropCategory || 'Paddy & Cereals',
      variety: variety ? variety.trim() : 'Standard / High Yielding Variety',
      quantity: parsedQuantity,
      quantityUnit,
      price: parsedPrice,
      priceUnit,
      location: location.trim(),
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      quality: quality || 'Grade A (Export Quality)',
      description: description ? description.trim() : '',
      images: Array.isArray(images) ? images : [],
      status: 'active'
    });

    return await listing.populate('farmer', 'name email mobile district state');
  }

  /**
   * Browse active marketplace listings with filtering & pagination
   */
  async getMarketplaceListings({
    cropName,
    cropCategory,
    location,
    minPrice,
    maxPrice,
    quality,
    status = 'active',
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { status };

    if (cropName && cropName.trim()) {
      query.cropName = { $regex: cropName.trim(), $options: 'i' };
    }

    if (cropCategory && cropCategory.trim()) {
      query.cropCategory = cropCategory.trim();
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (quality && quality.trim()) {
      query.quality = quality.trim();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    const [listings, total] = await Promise.all([
      CropListing.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('farmer', 'name email mobile district state')
        .lean(),
      CropListing.countDocuments(query)
    ]);

    return {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get all crop listings belonging to the authenticated farmer
   */
  async getFarmerListings(farmerId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { farmer: farmerId };
    if (status) {
      query.status = status;
    }

    const [listings, total] = await Promise.all([
      CropListing.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      CropListing.countDocuments(query)
    ]);

    return {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get single listing by ID
   */
  async getListingById(listingId) {
    const listing = await CropListing.findById(listingId).populate('farmer', 'name email mobile district state');
    if (!listing) {
      throw createClientError('Crop listing not found', 404);
    }
    return listing;
  }

  /**
   * Update listing owned by the farmer (Mass-assignment protected)
   */
  async updateListing(listingId, farmerId, updateData) {
    const listing = await CropListing.findById(listingId);
    if (!listing) {
      throw createClientError('Crop listing not found', 404);
    }

    if (listing.farmer.toString() !== farmerId.toString()) {
      throw createClientError('Forbidden: You can only update your own crop listings', 403);
    }

    // Allowlisted fields only
    const allowed = ['quantity', 'price', 'quality', 'description', 'location', 'availableUntil', 'harvestDate'];
    allowed.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'quantity') {
          const val = Number(updateData[field]);
          if (val > 0) listing.quantity = val;
        } else if (field === 'price') {
          const val = Number(updateData[field]);
          if (val >= 0) listing.price = val;
        } else {
          listing[field] = updateData[field];
        }
      }
    });

    await listing.save();
    return listing;
  }

  /**
   * Delete or Cancel listing
   */
  async deleteListing(listingId, farmerId) {
    const listing = await CropListing.findById(listingId);
    if (!listing) {
      throw createClientError('Crop listing not found', 404);
    }

    if (listing.farmer.toString() !== farmerId.toString()) {
      throw createClientError('Forbidden: You can only delete your own crop listings', 403);
    }

    listing.status = 'cancelled';
    await listing.save();
    return { success: true, message: 'Crop listing cancelled successfully', id: listingId };
  }
}

module.exports = new CropListingService();
