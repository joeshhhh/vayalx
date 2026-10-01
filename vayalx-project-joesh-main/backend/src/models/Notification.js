// VAYALX Notification Model
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required']
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: [
          'order_created',
          'order_accepted',
          'order_rejected',
          'booking_created',
          'booking_accepted',
          'booking_rejected',
          'scheme_alert',
          'mandi_price_alert',
          'system'
        ],
        message: 'Invalid notification type'
      },
      default: 'system'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    relatedEntityModel: {
      type: String,
      trim: true,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
