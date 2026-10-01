// VAYALX Buyer Demand / Procurement Tender Model
const mongoose = require('mongoose');

const buyerDemandSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required']
    },
    cropName: {
      type: String,
      required: [true, 'Required crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters']
    },
    cropCategory: {
      type: String,
      trim: true,
      default: 'Vegetables'
    },
    requiredQuantity: {
      type: Number,
      required: [true, 'Required quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      trim: true,
      enum: {
        values: ['Kg', 'Quintals', 'Tons', 'Bunches', 'Bags'],
        message: 'Invalid quantity unit'
      },
      default: 'Kg'
    },
    targetPrice: {
      type: Number,
      required: [true, 'Target purchase price is required'],
      min: [0, 'Target price cannot be negative']
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Delivery destination location is required'],
      trim: true
    },
    requiredBy: {
      type: Date,
      required: [true, 'Required-by date is required']
    },
    qualityRequirements: {
      type: String,
      trim: true,
      default: 'Uniform grading, moisture content under standard APMC limits'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Demand status is required'],
      enum: {
        values: ['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
        message: 'Status must be one of: open, partially_fulfilled, fulfilled, cancelled, expired'
      },
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
buyerDemandSchema.index({ buyer: 1, status: 1 });
buyerDemandSchema.index({ cropName: 1, status: 1 });
buyerDemandSchema.index({ requiredBy: 1 });
buyerDemandSchema.index({ createdAt: -1 });

const BuyerDemand = mongoose.models.BuyerDemand || mongoose.model('BuyerDemand', buyerDemandSchema);

module.exports = BuyerDemand;
