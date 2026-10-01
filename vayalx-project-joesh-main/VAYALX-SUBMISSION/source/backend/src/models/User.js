// VAYALX User Model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        'Please provide a valid 10-digit Indian mobile number starting with 6-9'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: [8, 'Password hash must be valid']
    },
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: ['farmer', 'buyer', 'supplier', 'admin'],
        message: 'Role must be one of: farmer, buyer, supplier, admin'
      },
      default: 'farmer'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for active role lookups
userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
