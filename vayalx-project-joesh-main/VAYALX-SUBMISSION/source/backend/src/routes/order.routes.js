// VAYALX Purchase Order Routes (Phase 4)
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All order operations require authentication
router.use(requireAuth);

// Buyer creates order
router.post('/', requireRole('buyer', 'admin'), orderController.createOrder);

// Role-based retrieval
router.get('/my', orderController.getMyOrders);
router.get('/received', requireRole('farmer', 'admin'), orderController.getReceivedOrders);
router.get('/:id', orderController.getOrderById);

// Farmer workflow transitions
router.patch('/:id/accept', requireRole('farmer', 'admin'), orderController.acceptOrder);
router.patch('/:id/reject', requireRole('farmer', 'admin'), orderController.rejectOrder);

// Buyer cancellation
router.patch('/:id/cancel', requireRole('buyer', 'admin'), orderController.cancelOrder);

module.exports = router;
