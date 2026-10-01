// VAYALX Prebooking Routes (Phase 4)
const express = require('express');
const router = express.Router();
const prebookingController = require('../controllers/prebooking.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

router.post('/', requireRole('farmer', 'admin'), prebookingController.createPrebooking);
router.get('/my', requireRole('farmer', 'admin'), prebookingController.getMyPrebookings);
router.patch('/:id/cancel', requireRole('farmer', 'admin'), prebookingController.cancelPrebooking);

module.exports = router;
