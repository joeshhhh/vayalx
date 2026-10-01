// VAYALX Farm Record Ledger Model (Agronomic Activity & Expense Log)
const mongoose = require('mongoose');

const farmRecordSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required']
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true,
      enum: {
        values: [
          'planting',
          'irrigation',
          'fertilization',
          'pesticide',
          'harvesting',
          'soil_preparation',
          'weeding',
          'other'
        ],
        message: 'Invalid farming activity type'
      },
      default: 'fertilization'
    },
    activityDate: {
      type: Date,
      required: [true, 'Activity date is required'],
      default: Date.now
    },
    inputs: {
      type: String,
      trim: true,
      default: 'Standard input'
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    quantityUnit: {
      type: String,
      trim: true,
      default: 'Kg'
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative']
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Field'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    attachments: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes
farmRecordSchema.index({ farmer: 1, activityDate: -1 });
farmRecordSchema.index({ farmer: 1, crop: 1, activityType: 1 });

const FarmRecord = mongoose.models.FarmRecord || mongoose.model('FarmRecord', farmRecordSchema);

module.exports = FarmRecord;
