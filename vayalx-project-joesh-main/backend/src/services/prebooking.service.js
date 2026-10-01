const crypto = require('crypto');
// VAYALX Smart Prebooking Service (Phase 4 Advance Harvest & Mandi Tokens)
const { Prebooking } = require('../models');
const { createClientError } = require('../utils/error.util');

class PrebookingService {
  /**
   * Create prebooking token
   */
  async createPrebooking(farmerId, data) {
    const { cropName, quantity, quantityUnit = 'Kg', expectedPrice, expectedHarvestDate, mandiLocation = 'Koyambedu APMC / Direct Farm Gate', notes = '' } = data;

    if (!cropName || !cropName.trim()) {
      throw createClientError('Crop name is required', 400);
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      throw createClientError('Estimated quantity must be greater than zero', 400);
    }

    const parsedPrice = Number(expectedPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw createClientError('Expected price cannot be negative', 400);
    }

    if (!expectedHarvestDate) {
      throw createClientError('Expected harvest date is required', 400);
    }

    const tokenCode = 'TK-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const prebooking = await Prebooking.create({
      farmer: farmerId,
      cropName: cropName.trim(),
      quantity: parsedQty,
      quantityUnit,
      expectedPrice: parsedPrice,
      expectedHarvestDate: new Date(expectedHarvestDate),
      tokenCode,
      mandiLocation: mandiLocation.trim(),
      notes: notes.trim(),
      status: 'pending'
    });

    return prebooking;
  }

  /**
   * Get prebookings for authenticated farmer
   */
  async getFarmerPrebookings(farmerId, { page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [prebookings, total] = await Promise.all([
      Prebooking.find({ farmer: farmerId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Prebooking.countDocuments({ farmer: farmerId })
    ]);

    return {
      prebookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Cancel prebooking
   */
  async cancelPrebooking(prebookingId, farmerId) {
    const prebooking = await Prebooking.findOne({ _id: prebookingId, farmer: farmerId });
    if (!prebooking) {
      throw createClientError('Prebooking not found or unauthorized', 404);
    }

    prebooking.status = 'cancelled';
    await prebooking.save();
    return prebooking;
  }
}

module.exports = new PrebookingService();
