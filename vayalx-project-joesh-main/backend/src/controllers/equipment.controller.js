// VAYALX Equipment Controller (Phase 4)
const equipmentService = require('../services/equipment.service');
const { asyncHandler } = require('../middleware/error.middleware');

class EquipmentController {
  createEquipment = asyncHandler(async (req, res) => {
    const equipment = await equipmentService.createEquipment(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Equipment listed successfully in sharing hub',
      data: equipment
    });
  });

  getMarketplaceEquipment = asyncHandler(async (req, res) => {
    const result = await equipmentService.getMarketplaceEquipment(req.query);
    res.status(200).json({
      success: true,
      data: result.equipment,
      pagination: result.pagination
    });
  });

  getMyEquipment = asyncHandler(async (req, res) => {
    const result = await equipmentService.getSupplierEquipment(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.equipment,
      pagination: result.pagination
    });
  });

  getEquipmentById = asyncHandler(async (req, res) => {
    const item = await equipmentService.getEquipmentById(req.params.id);
    res.status(200).json({
      success: true,
      data: item
    });
  });

  updateEquipment = asyncHandler(async (req, res) => {
    const item = await equipmentService.updateEquipment(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: item
    });
  });

  deleteEquipment = asyncHandler(async (req, res) => {
    const result = await equipmentService.deleteEquipment(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  });
}

module.exports = new EquipmentController();
