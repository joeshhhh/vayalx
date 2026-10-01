// VAYALX Farmer Profile Model
const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    farmName: {
      type: String,
      trim: true,
      default: 'My Vayal Farm',
      maxlength: [120, 'Farm name cannot exceed 120 characters']
    },
    location: {
      type: String,
      trim: true,
      default: 'Tamil Nadu',
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    district: {
      type: String,
      required: [true, 'Tamil Nadu district is required'],
      trim: true,
      default: 'Thanjavur'
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
    landArea: {
      type: Number,
      required: [true, 'Land area is required'],
      min: [0.1, 'Land area must be greater than 0'],
      default: 4.5
    },
    landUnit: {
      type: String,
      trim: true,
      enum: {
        values: ['Acres', 'Cents', 'Hectares', 'Gunthas'],
        message: 'Land unit must be one of: Acres, Cents, Hectares, Gunthas'
      },
      default: 'Acres'
    },
    crops: {
      type: [String],
      default: ['Paddy', 'Banana']
    },
    farmingType: {
      type: String,
      trim: true,
      enum: {
        values: ['Organic', 'Precision / Smart', 'Conventional', 'Hydroponic', 'Natural'],
        message: 'Farming type must be one of: Organic, Precision / Smart, Conventional, Hydroponic, Natural'
      },
      default: 'Precision / Smart'
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
      default: 5
    },
    profileImage: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound and attribute indexes
farmerProfileSchema.index({ district: 1, state: 1 });
farmerProfileSchema.index({ crops: 1 });

const FarmerProfile = mongoose.models.FarmerProfile || mongoose.model('FarmerProfile', farmerProfileSchema);

module.exports = FarmerProfile;
