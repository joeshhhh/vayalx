// VAYALX Buyer Demand Routes (Phase 4)
const express = require('express');
const router = express.Router();
const buyerDemandController = require('../controllers/buyerDemand.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public / Farmers browsing open tenders
router.get('/open', buyerDemandController.getOpenDemands);

// Buyer operations
router.post('/', requireAuth, requireRole('buyer', 'admin'), buyerDemandController.createDemand);
router.get('/my', requireAuth, requireRole('buyer', 'admin'), buyerDemandController.getMyDemands);
router.patch('/:id/cancel', requireAuth, requireRole('buyer', 'admin'), buyerDemandController.cancelDemand);

module.exports = router;
