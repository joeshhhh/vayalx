// VAYALX Equipment Booking Model (Machinery Rental Reservations)
const mongoose = require('mongoose');

const equipmentBookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment reference is required']
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier reference is required']
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Booking start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Booking end date is required'],
      validate: {
        validator: function (val) {
          if (!val || !this.startDate) return true;
          return val > this.startDate;
        },
        message: 'End date must be strictly after start date'
      }
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Booking duration must be at least 1 day']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Farm delivery location is required'],
      trim: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Booking status is required'],
      enum: {
        values: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
        message: 'Invalid booking status'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
equipmentBookingSchema.index({ equipment: 1, startDate: 1, endDate: 1 });
equipmentBookingSchema.index({ farmer: 1, status: 1 });
equipmentBookingSchema.index({ supplier: 1, status: 1 });
equipmentBookingSchema.index({ status: 1, createdAt: -1 });

const EquipmentBooking = mongoose.models.EquipmentBooking || mongoose.model('EquipmentBooking', equipmentBookingSchema);

module.exports = EquipmentBooking;
