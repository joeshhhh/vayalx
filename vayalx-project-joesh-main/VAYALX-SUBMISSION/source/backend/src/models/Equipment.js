// VAYALX Equipment Model (Farm Machinery & Rental Fleet)
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier reference is required']
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    category: {
      type: String,
      required: [true, 'Equipment category is required'],
      trim: true,
      enum: {
        values: [
          'Tractors',
          'Harvesters & Threshers',
          'Power Tillers & Rotavators',
          'Drone Sprayers',
          'Solar Pump & Micro-Irrigation',
          'Seeding & Planting Equipment',
          'Post-Harvest & Processing'
        ],
        message: 'Invalid equipment category'
      },
      default: 'Tractors'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Daily price cannot be negative']
    },
    pricePerHour: {
      type: Number,
      default: 0,
      min: [0, 'Hourly price cannot be negative']
    },
    availability: {
      type: Boolean,
      default: true
    },
    location: {
      type: String,
      required: [true, 'Machinery location / Hub is required'],
      trim: true
    },
    district: {
      type: String,
      trim: true,
      default: 'Coimbatore'
    },
    images: {
      type: [String],
      default: []
    },
    specifications: {
      hp: { type: String, default: '' },
      fuelType: { type: String, default: 'Diesel' },
      operatorIncluded: { type: Boolean, default: true },
      attachments: { type: [String], default: [] }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['available', 'booked', 'maintenance', 'inactive'],
        message: 'Status must be one of: available, booked, maintenance, inactive'
      },
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
equipmentSchema.index({ supplier: 1, status: 1 });
equipmentSchema.index({ category: 1, status: 1 });
equipmentSchema.index({ location: 1, district: 1 });
equipmentSchema.index({ pricePerDay: 1 });

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
