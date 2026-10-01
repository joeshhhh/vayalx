// VAYALX Equipment Booking Service (Phase 4 Connected Marketplace)
const { EquipmentBooking, Equipment, User } = require('../models');
const notificationService = require('./notification.service');
const { createClientError } = require('../utils/error.util');

class BookingService {
  /**
   * Farmer books machinery rental
   */
  async createBooking(farmerId, bookingData) {
    const { equipmentId, startDate, endDate, deliveryLocation, note } = bookingData;

    if (!equipmentId) {
      throw createClientError('Equipment ID is required', 400);
    }
    if (!startDate || !endDate) {
      throw createClientError('Start date and end date are required', 400);
    }
    if (!deliveryLocation || !deliveryLocation.trim()) {
      throw createClientError('Delivery farm location is required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw createClientError('Invalid booking date format', 400);
    }

    if (end <= start) {
      throw createClientError('Booking end date must be strictly after start date', 400);
    }

    // 1. Fetch authoritative Equipment from MongoDB
    const equipment = await Equipment.findById(equipmentId).populate('supplier', 'name email mobile');
    if (!equipment) {
      throw createClientError('Equipment not found', 404);
    }

    if (equipment.status !== 'available' || !equipment.availability) {
      throw createClientError(`Machinery is currently ${equipment.status} and unavailable for booking`, 400);
    }

    // 2. Prevent supplier from booking their own equipment
    if (equipment.supplier._id.toString() === farmerId.toString()) {
      throw createClientError('Suppliers cannot book their own equipment fleet', 400);
    }

    // 3. Check for Overlapping Accepted/Active Bookings (Conflict Detection)
    // Overlap rule: (existing.startDate < requested.endDate AND existing.endDate > requested.startDate)
    const conflictingBooking = await EquipmentBooking.findOne({
      equipment: equipmentId,
      status: { $in: ['accepted', 'active'] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (conflictingBooking) {
      throw createClientError(
        'Schedule conflict: This equipment is already booked and confirmed for the selected date range. Please choose alternative dates.',
        409
      );
    }

    // 4. Authoritative Server-Side Duration and Price Calculation
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const serverSideTotalAmount = Math.round(durationDays * equipment.pricePerDay * 100) / 100;

    // 5. Create Booking in MongoDB
    const booking = await EquipmentBooking.create({
      equipment: equipment._id,
      supplier: equipment.supplier._id,
      farmer: farmerId,
      startDate: start,
      endDate: end,
      durationDays,
      totalAmount: serverSideTotalAmount,
      deliveryLocation: deliveryLocation.trim(),
      note: note ? note.trim() : '',
      status: 'pending'
    });

    // 6. Fetch farmer details for notification
    const farmer = await User.findById(farmerId).select('name mobile email').lean();

    // 7. Dispatch Notification for Supplier
    try {
      await notificationService.notifyBookingCreated({
        supplierId: equipment.supplier._id,
        bookingId: booking._id,
        equipmentName: equipment.name,
        farmerName: farmer?.name || 'A farmer',
        durationDays
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch booking_created notification:', notifErr.message);
    }

    return await booking.populate([
      { path: 'equipment' },
      { path: 'supplier', select: 'name email mobile businessType' },
      { path: 'farmer', select: 'name email mobile district state' }
    ]);
  }

  /**
   * Get bookings made by the authenticated farmer
   */
  async getFarmerBookings(farmerId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { farmer: farmerId };
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      EquipmentBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('equipment')
        .populate('supplier', 'name email mobile district state')
        .lean(),
      EquipmentBooking.countDocuments(query)
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get incoming booking requests for the authenticated supplier
   */
  async getSupplierBookings(supplierId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { supplier: supplierId };
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      EquipmentBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('equipment')
        .populate('farmer', 'name email mobile district state')
        .lean(),
      EquipmentBooking.countDocuments(query)
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get single booking by ID with access control
   */
  async getBookingById(bookingId, userId, userRole) {
    const booking = await EquipmentBooking.findById(bookingId)
      .populate('equipment')
      .populate('supplier', 'name email mobile')
      .populate('farmer', 'name email mobile district state');

    if (!booking) {
      throw createClientError('Booking not found', 404);
    }

    const isFarmer = booking.farmer._id.toString() === userId.toString();
    const isSupplier = booking.supplier._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isFarmer && !isSupplier && !isAdmin) {
      throw createClientError('Forbidden: You are not authorized to view this booking', 403);
    }

    return booking;
  }

  /**
   * Supplier accepts an equipment booking
   */
  async acceptBooking(bookingId, supplierId) {
    const booking = await EquipmentBooking.findById(bookingId).populate('equipment');
    if (!booking) {
      throw createClientError('Booking not found', 404);
    }

    if (booking.supplier.toString() !== supplierId.toString()) {
      throw createClientError('Forbidden: Only the machinery owner can accept this booking', 403);
    }

    // Idempotency check
    if (booking.status === 'accepted') {
      return booking;
    }

    if (booking.status !== 'pending') {
      throw createClientError(`Cannot accept booking: Current status is '${booking.status}'`, 400);
    }

    // Check again for overlapping accepted bookings before confirming
    const conflict = await EquipmentBooking.findOne({
      _id: { $ne: booking._id },
      equipment: booking.equipment._id,
      status: { $in: ['accepted', 'active'] },
      startDate: { $lt: booking.endDate },
      endDate: { $gt: booking.startDate }
    });

    if (conflict) {
      throw createClientError('Cannot accept: A conflicting booking was already accepted for these dates', 409);
    }

    booking.status = 'accepted';
    await booking.save();

    const supplier = await User.findById(supplierId).select('name').lean();

    // Trigger Notification for Farmer
    try {
      await notificationService.notifyBookingAccepted({
        farmerId: booking.farmer,
        bookingId: booking._id,
        equipmentName: booking.equipment?.name || 'Machinery',
        supplierName: supplier?.name || 'The supplier'
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch booking_accepted notification:', notifErr.message);
    }

    return booking;
  }

  /**
   * Supplier rejects an equipment booking
   */
  async rejectBooking(bookingId, supplierId, { reason } = {}) {
    const booking = await EquipmentBooking.findById(bookingId).populate('equipment');
    if (!booking) {
      throw createClientError('Booking not found', 404);
    }

    if (booking.supplier.toString() !== supplierId.toString()) {
      throw createClientError('Forbidden: Only the machinery owner can decline this booking', 403);
    }

    if (booking.status === 'rejected') {
      return booking;
    }

    if (booking.status !== 'pending') {
      throw createClientError(`Cannot reject booking: Current status is '${booking.status}'`, 400);
    }

    booking.status = 'rejected';
    if (reason) booking.note = (booking.note ? booking.note + ' | ' : '') + `Rejected: ${reason}`;
    await booking.save();

    const supplier = await User.findById(supplierId).select('name').lean();

    // Trigger Notification for Farmer
    try {
      await notificationService.notifyBookingRejected({
        farmerId: booking.farmer,
        bookingId: booking._id,
        equipmentName: booking.equipment?.name || 'Machinery',
        supplierName: supplier?.name || 'The supplier'
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch booking_rejected notification:', notifErr.message);
    }

    return booking;
  }

  /**
   * Farmer cancels booking
   */
  async cancelBooking(bookingId, farmerId) {
    const booking = await EquipmentBooking.findById(bookingId);
    if (!booking) {
      throw createClientError('Booking not found', 404);
    }

    if (booking.farmer.toString() !== farmerId.toString()) {
      throw createClientError('Forbidden: You can only cancel your own bookings', 403);
    }

    if (booking.status !== 'pending') {
      throw createClientError(`Cannot cancel booking: Booking status is already '${booking.status}'`, 400);
    }

    booking.status = 'cancelled';
    await booking.save();
    return booking;
  }
}

module.exports = new BookingService();
