const crypto = require('crypto');
// VAYALX Prebooking Model (Advance Harvest & Mandi Queue Tokens)
const mongoose = require('mongoose');

const prebookingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required']
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    cropListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      default: null
    },
    quantity: {
      type: Number,
      required: [true, 'Estimated harvest quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      trim: true,
      default: 'Kg'
    },
    expectedPrice: {
      type: Number,
      required: [true, 'Expected or locked price is required'],
      min: [0, 'Expected price cannot be negative']
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required']
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    tokenCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: () => 'TK-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    },
    mandiLocation: {
      type: String,
      trim: true,
      default: 'Koyambedu APMC / Direct Farm Gate'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: 'Invalid prebooking status'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
prebookingSchema.index({ farmer: 1, status: 1 });
prebookingSchema.index({ buyer: 1, status: 1 });
prebookingSchema.index({ tokenCode: 1 }, { unique: true, sparse: true });
prebookingSchema.index({ expectedHarvestDate: 1 });

const Prebooking = mongoose.models.Prebooking || mongoose.model('Prebooking', prebookingSchema);

module.exports = Prebooking;
