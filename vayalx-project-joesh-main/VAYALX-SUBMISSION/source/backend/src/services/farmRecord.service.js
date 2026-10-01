// VAYALX Farm Record Ledger Service (Phase 4)
const { FarmRecord } = require('../models');
const { createClientError } = require('../utils/error.util');

class FarmRecordService {
  /**
   * Farmer adds a new agronomic activity / expense record
   */
  async createRecord(farmerId, recordData) {
    const { crop, activityType, activityDate, inputs, quantity = 0, quantityUnit = 'Kg', cost = 0, revenue = 0, location = 'Main Field', notes = '' } = recordData;

    if (!crop || !crop.trim()) {
      throw createClientError('Crop name is required', 400);
    }
    if (!activityType) {
      throw createClientError('Activity type is required', 400);
    }

    const record = await FarmRecord.create({
      farmer: farmerId,
      crop: crop.trim(),
      activityType,
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      inputs: inputs ? inputs.trim() : 'Standard input',
      quantity: Number(quantity) || 0,
      quantityUnit,
      cost: Number(cost) || 0,
      revenue: Number(revenue) || 0,
      location: location.trim(),
      notes: notes.trim()
    });

    return record;
  }

  /**
   * Get farm records for authenticated farmer
   */
  async getFarmerRecords(farmerId, { page = 1, limit = 50, crop, activityType } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const query = { farmer: farmerId };
    if (crop) query.crop = crop;
    if (activityType) query.activityType = activityType;

    const [records, total] = await Promise.all([
      FarmRecord.find(query).sort({ activityDate: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      FarmRecord.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get single farm record
   */
  async getRecordById(recordId, farmerId) {
    const record = await FarmRecord.findOne({ _id: recordId, farmer: farmerId });
    if (!record) {
      throw createClientError('Farm record not found', 404);
    }
    return record;
  }

  /**
   * Update farm record
   */
  async updateRecord(recordId, farmerId, updateData) {
    const record = await FarmRecord.findOne({ _id: recordId, farmer: farmerId });
    if (!record) {
      throw createClientError('Farm record not found', 404);
    }

    const allowed = ['crop', 'activityType', 'activityDate', 'inputs', 'quantity', 'quantityUnit', 'cost', 'revenue', 'location', 'notes'];
    allowed.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'cost' || field === 'revenue' || field === 'quantity') {
          record[field] = Number(updateData[field]) || 0;
        } else if (field === 'activityDate') {
          record[field] = new Date(updateData[field]);
        } else {
          record[field] = updateData[field];
        }
      }
    });

    await record.save();
    return record;
  }

  /**
   * Delete farm record
   */
  async deleteRecord(recordId, farmerId) {
    const record = await FarmRecord.findOneAndDelete({ _id: recordId, farmer: farmerId });
    if (!record) {
      throw createClientError('Farm record not found', 404);
    }
    return { success: true, message: 'Record deleted', id: recordId };
  }
}

module.exports = new FarmRecordService();
