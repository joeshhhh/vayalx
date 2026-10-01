// VAYALX Equipment Service (Phase 4 Machinery Fleet)
const { Equipment } = require('../models');
const { createClientError } = require('../utils/error.util');

class EquipmentService {
  /**
   * Supplier creates a new equipment listing
   */
  async createEquipment(supplierId, data) {
    const {
      name,
      category,
      description,
      pricePerDay,
      pricePerHour = 0,
      location,
      district = 'Coimbatore',
      specifications = {},
      images = []
    } = data;

    if (!name || !name.trim()) {
      throw createClientError('Equipment name is required', 400);
    }

    if (!category || !category.trim()) {
      throw createClientError('Equipment category is required', 400);
    }

    const parsedPricePerDay = Number(pricePerDay);
    if (isNaN(parsedPricePerDay) || parsedPricePerDay < 0) {
      throw createClientError('Price per day cannot be negative', 400);
    }

    if (!location || !location.trim()) {
      throw createClientError('Machinery location / Hub is required', 400);
    }

    const equipment = await Equipment.create({
      supplier: supplierId,
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      pricePerDay: parsedPricePerDay,
      pricePerHour: Number(pricePerHour) || 0,
      location: location.trim(),
      district: district.trim(),
      specifications: typeof specifications === 'object' ? specifications : {},
      images: Array.isArray(images) ? images : [],
      status: 'available',
      availability: true
    });

    return await equipment.populate('supplier', 'name email mobile businessType');
  }

  /**
   * Browse available equipment for Farmers
   */
  async getMarketplaceEquipment({ category, location, district, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'available' };
    if (category && category.trim()) query.category = category.trim();
    if (district && district.trim()) query.district = district.trim();
    if (location && location.trim()) query.location = { $regex: location.trim(), $options: 'i' };

    const [equipment, total] = await Promise.all([
      Equipment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('supplier', 'name email mobile district state')
        .lean(),
      Equipment.countDocuments(query)
    ]);

    return {
      equipment,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get supplier's own equipment fleet
   */
  async getSupplierEquipment(supplierId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { supplier: supplierId };
    if (status) query.status = status;

    const [equipment, total] = await Promise.all([
      Equipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Equipment.countDocuments(query)
    ]);

    return {
      equipment,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get single equipment details
   */
  async getEquipmentById(equipmentId) {
    const item = await Equipment.findById(equipmentId).populate('supplier', 'name email mobile district state');
    if (!item) {
      throw createClientError('Equipment not found', 404);
    }
    return item;
  }

  /**
   * Update equipment (Supplier ownership verified)
   */
  async updateEquipment(equipmentId, supplierId, updateData) {
    const item = await Equipment.findById(equipmentId);
    if (!item) {
      throw createClientError('Equipment not found', 404);
    }

    if (item.supplier.toString() !== supplierId.toString()) {
      throw createClientError('Forbidden: You can only edit machinery in your fleet', 403);
    }

    const allowed = ['name', 'category', 'description', 'pricePerDay', 'pricePerHour', 'location', 'district', 'specifications', 'status', 'availability'];
    allowed.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'pricePerDay' || field === 'pricePerHour') {
          const val = Number(updateData[field]);
          if (val >= 0) item[field] = val;
        } else {
          item[field] = updateData[field];
        }
      }
    });

    await item.save();
    return item;
  }

  /**
   * Deactivate / Delete equipment
   */
  async deleteEquipment(equipmentId, supplierId) {
    const item = await Equipment.findById(equipmentId);
    if (!item) {
      throw createClientError('Equipment not found', 404);
    }

    if (item.supplier.toString() !== supplierId.toString()) {
      throw createClientError('Forbidden: You can only delete your own equipment', 403);
    }

    item.status = 'inactive';
    item.availability = false;
    await item.save();
    return { success: true, message: 'Equipment deactivated successfully', id: equipmentId };
  }
}

module.exports = new EquipmentService();
