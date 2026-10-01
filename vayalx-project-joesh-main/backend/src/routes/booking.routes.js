// VAYALX Equipment Booking Routes (Phase 4)
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

// Farmer creates booking
router.post('/', requireRole('farmer', 'admin'), bookingController.createBooking);

// Role-based retrieval
router.get('/my', bookingController.getMyBookings);
router.get('/supplier', requireRole('supplier', 'admin'), bookingController.getSupplierBookings);
router.get('/:id', bookingController.getBookingById);

// Supplier workflow actions
router.patch('/:id/accept', requireRole('supplier', 'admin'), bookingController.acceptBooking);
router.patch('/:id/reject', requireRole('supplier', 'admin'), bookingController.rejectBooking);

// Farmer cancellation
router.patch('/:id/cancel', requireRole('farmer', 'admin'), bookingController.cancelBooking);

module.exports = router;
