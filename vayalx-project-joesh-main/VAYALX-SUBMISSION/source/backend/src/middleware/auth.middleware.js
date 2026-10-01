// VAYALX Authentication Middleware (Phase 3)
const env = require('../config/env');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyJwtToken } = require('../utils/auth.util');
const { User, FarmerProfile, BuyerProfile, SupplierProfile } = require('../models');

const requireAuth = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Extract token from HTTP-only Cookie first (Primary Secure Method)
  if (req.cookies && req.cookies[env.AUTH_COOKIE_NAME]) {
    token = req.cookies[env.AUTH_COOKIE_NAME];
  } else if (req.signedCookies && req.signedCookies[env.AUTH_COOKIE_NAME]) {
    token = req.signedCookies[env.AUTH_COOKIE_NAME];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // 2. Fallback to Authorization Header for programmatic/mobile API clients
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to continue.', 401));
  }

  // 3. Verify JWT Signature & Expiration
  let decoded;
  try {
    decoded = verifyJwtToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your authentication session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token. Please log in again.', 401));
  }

  if (!decoded || !decoded.sub) {
    return next(new AppError('Malformed authentication payload.', 401));
  }

  // 4. Confirm User exists in MongoDB (or fallback in standby/test mode)
  const mongoose = require('mongoose');
  let currentUser = null;

  if (mongoose.connection.readyState === 1) {
    currentUser = await User.findById(decoded.sub);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact VAYALX support.', 403));
    }
  } else {
    // Standby / offline test mode
    currentUser = {
      _id: decoded.sub,
      role: decoded.role || 'farmer',
      email: decoded.email || 'farmer@vayalx.demo',
      name: decoded.name || 'VAYALX Member',
      isActive: true
    };
  }

  // 6. Attach Server-Side Verified User to Request
  req.user = currentUser;

  // 7. Load Role Profile if available
  if (mongoose.connection.readyState === 1) {
    if (currentUser.role === 'farmer') {
      req.profile = await FarmerProfile.findOne({ user: currentUser._id });
    } else if (currentUser.role === 'buyer') {
      req.profile = await BuyerProfile.findOne({ user: currentUser._id });
    } else if (currentUser.role === 'supplier') {
      req.profile = await SupplierProfile.findOne({ user: currentUser._id });
    }
  }

  next();
});

module.exports = {
  requireAuth
};
