// VAYALX Purchase Order Model (Marketplace Contracts)
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required']
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required']
    },
    cropListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      default: null
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Order quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      trim: true,
      default: 'Kg'
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Delivery location is required'],
      trim: true
    },
    requestedDeliveryDate: {
      type: Date,
      default: null
    },
    buyerNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Buyer note cannot exceed 500 characters'],
      default: ''
    },
    farmerNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Farmer note cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Order status is required'],
      enum: {
        values: [
          'pending',
          'accepted',
          'rejected',
          'confirmed',
          'processing',
          'dispatched',
          'delivered',
          'cancelled'
        ],
        message: 'Invalid order status'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Automatic calculation & consistency middleware before save
purchaseOrderSchema.pre('validate', function (next) {
  if (this.quantity && this.unitPrice && (this.totalAmount === undefined || this.totalAmount === null)) {
    this.totalAmount = Math.round(this.quantity * this.unitPrice * 100) / 100;
  }
  next();
});

// Indexes
purchaseOrderSchema.index({ buyer: 1, status: 1 });
purchaseOrderSchema.index({ farmer: 1, status: 1 });
purchaseOrderSchema.index({ cropListing: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });

const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
