// VAYALX Equipment Routes (Phase 4)
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public / Farmer Browse
router.get('/', equipmentController.getMarketplaceEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Supplier Operations
router.post('/', requireAuth, requireRole('supplier', 'admin'), equipmentController.createEquipment);
router.get('/my', requireAuth, requireRole('supplier', 'admin'), equipmentController.getMyEquipment);
router.patch('/:id', requireAuth, requireRole('supplier', 'admin'), equipmentController.updateEquipment);
router.delete('/:id', requireAuth, requireRole('supplier', 'admin'), equipmentController.deleteEquipment);

module.exports = router;
