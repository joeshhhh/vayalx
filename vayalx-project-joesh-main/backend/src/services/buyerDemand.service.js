// VAYALX Buyer Demand / Tender Service (Phase 4)
const { BuyerDemand } = require('../models');
const { createClientError } = require('../utils/error.util');

class BuyerDemandService {
  /**
   * Buyer posts a new procurement demand
   */
  async createDemand(buyerId, demandData) {
    const {
      cropName,
      cropCategory = 'Vegetables',
      requiredQuantity,
      quantityUnit = 'Kg',
      targetPrice,
      deliveryLocation,
      requiredBy,
      qualityRequirements,
      description
    } = demandData;

    if (!cropName || !cropName.trim()) {
      throw createClientError('Crop name is required', 400);
    }

    const parsedQuantity = Number(requiredQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw createClientError('Required quantity must be greater than zero', 400);
    }

    const parsedPrice = Number(targetPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw createClientError('Target price cannot be negative', 400);
    }

    if (!deliveryLocation || !deliveryLocation.trim()) {
      throw createClientError('Delivery destination location is required', 400);
    }

    if (!requiredBy) {
      throw createClientError('Required-by date is required', 400);
    }

    const demand = await BuyerDemand.create({
      buyer: buyerId,
      cropName: cropName.trim(),
      cropCategory: cropCategory.trim(),
      requiredQuantity: parsedQuantity,
      quantityUnit,
      targetPrice: parsedPrice,
      deliveryLocation: deliveryLocation.trim(),
      requiredBy: new Date(requiredBy),
      qualityRequirements: qualityRequirements ? qualityRequirements.trim() : 'Standard quality',
      description: description ? description.trim() : '',
      status: 'open'
    });

    return await demand.populate('buyer', 'name email mobile businessType');
  }

  /**
   * Get demands posted by authenticated buyer
   */
  async getMyDemands(buyerId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { buyer: buyerId };
    if (status) query.status = status;

    const [demands, total] = await Promise.all([
      BuyerDemand.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      BuyerDemand.countDocuments(query)
    ]);

    return {
      demands,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get open buyer demands (for Farmers / Public Marketplace)
   */
  async getOpenDemands({ cropName, cropCategory, location, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'open' };

    if (cropName && cropName.trim()) {
      query.cropName = { $regex: cropName.trim(), $options: 'i' };
    }
    if (cropCategory && cropCategory.trim()) {
      query.cropCategory = cropCategory.trim();
    }
    if (location && location.trim()) {
      query.deliveryLocation = { $regex: location.trim(), $options: 'i' };
    }

    const [demands, total] = await Promise.all([
      BuyerDemand.find(query)
        .sort({ requiredBy: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('buyer', 'name businessType district state')
        .lean(),
      BuyerDemand.countDocuments(query)
    ]);

    return {
      demands,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Cancel demand
   */
  async cancelDemand(demandId, buyerId) {
    const demand = await BuyerDemand.findById(demandId);
    if (!demand) {
      throw createClientError('Demand not found', 404);
    }

    if (demand.buyer.toString() !== buyerId.toString()) {
      throw createClientError('Forbidden: You can only cancel your own procurement demands', 403);
    }

    demand.status = 'cancelled';
    await demand.save();
    return demand;
  }
}

module.exports = new BuyerDemandService();
