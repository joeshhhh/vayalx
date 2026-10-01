// VAYALX Supplier Profile Model
const mongoose = require('mongoose');

const supplierProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Supplier business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters']
    },
    supplierType: {
      type: String,
      required: [true, 'Supplier type is required'],
      trim: true,
      enum: {
        values: [
          'Machinery & Equipment Rental',
          'Agri Inputs (Seeds & Bio-Fertilizers)',
          'Irrigation & Solar Tech Solutions',
          'Drone Spraying Services',
          'Harvesting Contractors'
        ],
        message: 'Invalid supplier type'
      },
      default: 'Machinery & Equipment Rental'
    },
    location: {
      type: String,
      trim: true,
      default: 'Coimbatore, Tamil Nadu'
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      default: 'Coimbatore'
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
    equipmentCategories: {
      type: [String],
      default: ['Tractors', 'Harvesters', 'Power Tillers', 'Drone Sprayers', 'Drip Kits']
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
supplierProfileSchema.index({ district: 1, supplierType: 1 });

const SupplierProfile = mongoose.models.SupplierProfile || mongoose.model('SupplierProfile', supplierProfileSchema);

module.exports = SupplierProfile;
