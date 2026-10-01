// VAYALX Equipment Booking Controller (Phase 4)
const bookingService = require('../services/booking.service');
const { asyncHandler } = require('../middleware/error.middleware');

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Machinery booking request placed. Supplier notified.',
      data: booking
    });
  });

  getMyBookings = asyncHandler(async (req, res) => {
    if (req.user.role === 'supplier') {
      const result = await bookingService.getSupplierBookings(req.user._id, req.query);
      return res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } else {
      const result = await bookingService.getFarmerBookings(req.user._id, req.query);
      return res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    }
  });

  getSupplierBookings = asyncHandler(async (req, res) => {
    const result = await bookingService.getSupplierBookings(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination
    });
  });

  getBookingById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: booking
    });
  });

  acceptBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.acceptBooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Machinery rental booking accepted. Farmer notified.',
      data: booking
    });
  });

  rejectBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.rejectBooking(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Machinery rental booking rejected. Farmer notified.',
      data: booking
    });
  });

  cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  });
}

module.exports = new BookingController();
