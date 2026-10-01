// VAYALX Notification Service (Phase 4)
const { Notification } = require('../models');
const { createClientError } = require('../utils/error.util');

class NotificationService {
  /**
   * Create and persist a notification
   */
  async createNotification({ recipient, type, title, message, relatedEntity = null, relatedEntityModel = null }) {
    if (!recipient) {
      throw createClientError('Recipient ID is required for notification', 400);
    }

    const notification = await Notification.create({
      recipient,
      type: type || 'system',
      title,
      message,
      relatedEntity,
      relatedEntityModel,
      isRead: false
    });

    return notification;
  }

  /**
   * Helper: Order Created Notification (for Farmer)
   */
  async notifyOrderCreated({ farmerId, orderId, cropName, quantity, buyerName }) {
    return this.createNotification({
      recipient: farmerId,
      type: 'order_created',
      title: 'New Purchase Order Received',
      message: `Buyer ${buyerName || 'a registered buyer'} placed an order for ${quantity} ${cropName}.`,
      relatedEntity: orderId,
      relatedEntityModel: 'PurchaseOrder'
    });
  }

  /**
   * Helper: Order Accepted Notification (for Buyer)
   */
  async notifyOrderAccepted({ buyerId, orderId, cropName, farmerName }) {
    return this.createNotification({
      recipient: buyerId,
      type: 'order_accepted',
      title: 'Order Confirmed by Farmer',
      message: `Farmer ${farmerName || 'The farmer'} has accepted your purchase order for ${cropName}.`,
      relatedEntity: orderId,
      relatedEntityModel: 'PurchaseOrder'
    });
  }

  /**
   * Helper: Order Rejected Notification (for Buyer)
   */
  async notifyOrderRejected({ buyerId, orderId, cropName, farmerName, reason }) {
    const reasonText = reason ? ` Reason: ${reason}` : '';
    return this.createNotification({
      recipient: buyerId,
      type: 'order_rejected',
      title: 'Order Declined',
      message: `Farmer ${farmerName || 'The farmer'} could not fulfill your order for ${cropName}.${reasonText}`,
      relatedEntity: orderId,
      relatedEntityModel: 'PurchaseOrder'
    });
  }

  /**
   * Helper: Booking Created Notification (for Supplier)
   */
  async notifyBookingCreated({ supplierId, bookingId, equipmentName, farmerName, durationDays }) {
    return this.createNotification({
      recipient: supplierId,
      type: 'booking_created',
      title: 'New Machinery Booking Request',
      message: `Farmer ${farmerName || 'A farmer'} requested to rent ${equipmentName} for ${durationDays} day(s).`,
      relatedEntity: bookingId,
      relatedEntityModel: 'EquipmentBooking'
    });
  }

  /**
   * Helper: Booking Accepted Notification (for Farmer)
   */
  async notifyBookingAccepted({ farmerId, bookingId, equipmentName, supplierName }) {
    return this.createNotification({
      recipient: farmerId,
      type: 'booking_accepted',
      title: 'Machinery Booking Confirmed',
      message: `Supplier ${supplierName || 'The supplier'} confirmed your booking for ${equipmentName}.`,
      relatedEntity: bookingId,
      relatedEntityModel: 'EquipmentBooking'
    });
  }

  /**
   * Helper: Booking Rejected Notification (for Farmer)
   */
  async notifyBookingRejected({ farmerId, bookingId, equipmentName, supplierName }) {
    return this.createNotification({
      recipient: farmerId,
      type: 'booking_rejected',
      title: 'Machinery Booking Unavailable',
      message: `Supplier ${supplierName || 'The supplier'} was unable to accept your booking for ${equipmentName}.`,
      relatedEntity: bookingId,
      relatedEntityModel: 'EquipmentBooking'
    });
  }

  /**
   * Get paginated notifications for authenticated user
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { recipient: userId };
    if (unreadOnly === true || unreadOnly === 'true') {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });
    return { count };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
    if (!notification) {
      throw createClientError('Notification not found or unauthorized', 404);
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } });
    return { markedCount: result.modifiedCount };
  }
}

module.exports = new NotificationService();
