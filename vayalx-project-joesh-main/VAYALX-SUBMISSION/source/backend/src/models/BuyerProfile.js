// VAYALX Buyer Profile Model
const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters']
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
      enum: {
        values: [
          'Wholesaler',
          'Retailer / Supermarket',
          'Exporter',
          'Food Processing Unit',
          'Corporate Procurement',
          'Direct Aggregator'
        ],
        message: 'Invalid business type'
      },
      default: 'Wholesaler'
    },
    location: {
      type: String,
      trim: true,
      default: 'Chennai, Tamil Nadu'
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      default: 'Chennai'
    },
    state: {
      type: String,
      trim: true,
      default: 'Tamil Nadu'
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit Indian PIN code']
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    preferredCrops: {
      type: [String],
      default: ['Paddy', 'Turmeric', 'Tomato', 'Banana', 'Small Onion']
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
buyerProfileSchema.index({ district: 1, businessType: 1 });

const BuyerProfile = mongoose.models.BuyerProfile || mongoose.model('BuyerProfile', buyerProfileSchema);

module.exports = BuyerProfile;
