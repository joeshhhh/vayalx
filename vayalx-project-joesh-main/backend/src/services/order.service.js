// VAYALX Purchase Order Service (Phase 4 Connected Marketplace)
const { PurchaseOrder, CropListing, User } = require('../models');
const notificationService = require('./notification.service');
const { createClientError } = require('../utils/error.util');

class OrderService {
  /**
   * Buyer creates purchase order against an active crop listing
   */
  async createOrder(buyerId, orderData) {
    const { cropListingId, quantity, deliveryLocation, requestedDeliveryDate, buyerNote } = orderData;

    if (!cropListingId) {
      throw createClientError('Crop listing ID is required', 400);
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw createClientError('Order quantity must be greater than zero', 400);
    }

    if (!deliveryLocation || !deliveryLocation.trim()) {
      throw createClientError('Delivery destination location is required', 400);
    }

    // 1. Fetch authoritative CropListing from MongoDB
    const listing = await CropListing.findById(cropListingId).populate('farmer', 'name email mobile');
    if (!listing) {
      throw createClientError('Crop listing not found', 404);
    }

    if (listing.status !== 'active') {
      throw createClientError(`Cannot place order: Listing is currently ${listing.status}`, 400);
    }

    if (parsedQuantity > listing.quantity) {
      throw createClientError(
        `Insufficient available quantity. Requested ${parsedQuantity} ${listing.quantityUnit}, but only ${listing.quantity} ${listing.quantityUnit} available.`,
        400
      );
    }

    // 2. Prevent farmer from buying their own listing
    if (listing.farmer._id.toString() === buyerId.toString()) {
      throw createClientError('Farmers cannot place purchase orders on their own listings', 400);
    }

    // 3. Authoritative server-side price calculation (NEVER trust client price)
    const serverSideUnitPrice = listing.price;
    const serverSideTotalAmount = Math.round(parsedQuantity * serverSideUnitPrice * 100) / 100;

    // 4. Create Purchase Order in MongoDB
    const order = await PurchaseOrder.create({
      buyer: buyerId,
      farmer: listing.farmer._id,
      cropListing: listing._id,
      cropName: listing.cropName,
      quantity: parsedQuantity,
      quantityUnit: listing.quantityUnit,
      unitPrice: serverSideUnitPrice,
      totalAmount: serverSideTotalAmount,
      deliveryLocation: deliveryLocation.trim(),
      requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : null,
      buyerNote: buyerNote ? buyerNote.trim() : '',
      status: 'pending'
    });

    // 5. Fetch buyer details for notification message
    const buyer = await User.findById(buyerId).select('name mobile email').lean();

    // 6. Trigger Notification for Farmer
    try {
      await notificationService.notifyOrderCreated({
        farmerId: listing.farmer._id,
        orderId: order._id,
        cropName: listing.cropName,
        quantity: `${parsedQuantity} ${listing.quantityUnit}`,
        buyerName: buyer?.name || 'A buyer'
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch order_created notification:', notifErr.message);
    }

    return await order.populate([
      { path: 'buyer', select: 'name email mobile businessType' },
      { path: 'farmer', select: 'name email mobile district state' },
      { path: 'cropListing' }
    ]);
  }

  /**
   * Get orders placed by the authenticated buyer
   */
  async getBuyerOrders(buyerId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { buyer: buyerId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('farmer', 'name email mobile district state')
        .populate('cropListing', 'cropName variety quality images')
        .lean(),
      PurchaseOrder.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get incoming orders received by the authenticated farmer
   */
  async getFarmerOrders(farmerId, { page = 1, limit = 20, status } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { farmer: farmerId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('buyer', 'name email mobile businessType')
        .populate('cropListing', 'cropName variety quality images')
        .lean(),
      PurchaseOrder.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get order by ID with tenant security check
   */
  async getOrderById(orderId, userId, userRole) {
    const order = await PurchaseOrder.findById(orderId)
      .populate('buyer', 'name email mobile businessType')
      .populate('farmer', 'name email mobile district state')
      .populate('cropListing');

    if (!order) {
      throw createClientError('Purchase order not found', 404);
    }

    const isBuyer = order.buyer._id.toString() === userId.toString();
    const isFarmer = order.farmer._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      throw createClientError('Forbidden: You are not authorized to view this purchase order', 403);
    }

    return order;
  }

  /**
   * Farmer accepts an incoming purchase order
   */
  async acceptOrder(orderId, farmerId, { farmerNote } = {}) {
    const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      throw createClientError('Purchase order not found', 404);
    }

    if (order.farmer.toString() !== farmerId.toString()) {
      throw createClientError('Forbidden: Only the receiving farmer can accept this order', 403);
    }

    // Idempotency / state transition check
    if (order.status === 'accepted') {
      return order; // Idempotent success
    }

    if (order.status !== 'pending') {
      throw createClientError(`Cannot accept order: Current status is '${order.status}'`, 400);
    }

    order.status = 'accepted';
    if (farmerNote) order.farmerNote = farmerNote.trim();
    await order.save();

    // Deduct remaining inventory from listing if listing exists
    if (order.cropListing) {
      const listing = await CropListing.findById(order.cropListing);
      if (listing) {
        const remainingQty = Math.max(0, listing.quantity - order.quantity);
        listing.quantity = remainingQty;
        if (remainingQty <= 0) {
          listing.status = 'sold';
        }
        await listing.save();
      }
    }

    // Fetch farmer details for notification
    const farmer = await User.findById(farmerId).select('name').lean();

    // Trigger Notification for Buyer
    try {
      await notificationService.notifyOrderAccepted({
        buyerId: order.buyer,
        orderId: order._id,
        cropName: order.cropName,
        farmerName: farmer?.name || 'The farmer'
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch order_accepted notification:', notifErr.message);
    }

    return order;
  }

  /**
   * Farmer rejects an incoming purchase order
   */
  async rejectOrder(orderId, farmerId, { reason, farmerNote } = {}) {
    const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      throw createClientError('Purchase order not found', 404);
    }

    if (order.farmer.toString() !== farmerId.toString()) {
      throw createClientError('Forbidden: Only the receiving farmer can reject this order', 403);
    }

    // Idempotency check
    if (order.status === 'rejected') {
      return order;
    }

    if (order.status !== 'pending') {
      throw createClientError(`Cannot decline order: Current status is '${order.status}'`, 400);
    }

    order.status = 'rejected';
    if (farmerNote || reason) order.farmerNote = (farmerNote || reason).trim();
    await order.save();

    const farmer = await User.findById(farmerId).select('name').lean();

    // Trigger Notification for Buyer
    try {
      await notificationService.notifyOrderRejected({
        buyerId: order.buyer,
        orderId: order._id,
        cropName: order.cropName,
        farmerName: farmer?.name || 'The farmer',
        reason: order.farmerNote
      });
    } catch (notifErr) {
      console.warn('[VAYALX NOTIFICATION WARNING]: Failed to dispatch order_rejected notification:', notifErr.message);
    }

    return order;
  }

  /**
   * Buyer cancels an existing pending purchase order
   */
  async cancelOrder(orderId, buyerId, { reason } = {}) {
    const order = await PurchaseOrder.findById(orderId);
    if (!order) {
      throw createClientError('Purchase order not found', 404);
    }

    if (order.buyer.toString() !== buyerId.toString()) {
      throw createClientError('Forbidden: You can only cancel your own purchase orders', 403);
    }

    if (order.status !== 'pending') {
      throw createClientError(`Cannot cancel order: Order is already '${order.status}'`, 400);
    }

    order.status = 'cancelled';
    if (reason) order.buyerNote = (order.buyerNote ? order.buyerNote + ' | ' : '') + `Cancelled: ${reason}`;
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
