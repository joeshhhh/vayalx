// VAYALX Crop Listing Model (Farmer Offerings)
const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required']
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters']
    },
    cropCategory: {
      type: String,
      trim: true,
      enum: {
        values: ['Paddy & Cereals', 'Millets', 'Pulses', 'Spices & Condiments', 'Vegetables', 'Fruits', 'Commercial Crops'],
        message: 'Invalid crop category'
      },
      default: 'Paddy & Cereals'
    },
    variety: {
      type: String,
      trim: true,
      default: 'Standard / High Yielding Variety'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    priceUnit: {
      type: String,
      required: [true, 'Price unit is required'],
      trim: true,
      default: '₹/kg'
    },
    location: {
      type: String,
      required: [true, 'Farm location is required'],
      trim: true
    },
    harvestDate: {
      type: Date,
      default: null
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: {
      type: Date,
      validate: {
        validator: function (val) {
          if (!val || !this.availableFrom) return true;
          return val >= this.availableFrom;
        },
        message: 'availableUntil date must be on or after availableFrom date'
      }
    },
    quality: {
      type: String,
      trim: true,
      enum: {
        values: ['Grade A (Export Quality)', 'Grade B (Standard Market)', 'Grade C (Processing / Bulk)', 'Organic Certified'],
        message: 'Invalid quality grade'
      },
      default: 'Grade A (Export Quality)'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      required: [true, 'Listing status is required'],
      enum: {
        values: ['active', 'reserved', 'sold', 'expired', 'cancelled'],
        message: 'Status must be one of: active, reserved, sold, expired, cancelled'
      },
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching, filtering, and geolocation matching
cropListingSchema.index({ farmer: 1, status: 1 });
cropListingSchema.index({ cropName: 1, status: 1, price: 1 });
cropListingSchema.index({ location: 1, status: 1 });
cropListingSchema.index({ createdAt: -1 });

const CropListing = mongoose.models.CropListing || mongoose.model('CropListing', cropListingSchema);

module.exports = CropListing;
