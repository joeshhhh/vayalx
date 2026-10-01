// VAYALX Authentication Service (Phase 3)
const AppError = require('../utils/appError');
const {
  hashPassword,
  comparePassword,
  generateJwtToken,
  sanitizeUser
} = require('../utils/auth.util');
const {
  User,
  FarmerProfile,
  BuyerProfile,
  SupplierProfile
} = require('../models');

class AuthService {
  // 1. User Registration
  static async registerUser(userData) {
    const {
      name,
      email,
      mobile,
      password,
      role = 'farmer',
      // Optional profile metadata provided at registration
      district = 'Thanjavur',
      farmName,
      crop,
      crops,
      acres,
      landArea,
      businessName,
      businessType,
      supplierType,
      equipmentCategories
    } = userData;

    // Reject public admin registration
    if (role === 'admin') {
      throw new AppError('Public registration as admin is prohibited. Administrator accounts must be provisioned through secure server credentials.', 400);
    }

    if (!['farmer', 'buyer', 'supplier'].includes(role)) {
      throw new AppError(`Invalid role '${role}'. Supported roles are: farmer, buyer, supplier.`, 400);
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const normalizedMobile = (mobile || '').trim();

    // Check for existing accounts
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw new AppError('An account with this email address already exists. Please log in.', 400);
      }
      if (existingUser.mobile === normalizedMobile) {
        throw new AppError('An account with this mobile number already exists. Please log in.', 400);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create User
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      passwordHash,
      role,
      isActive: true,
      lastLoginAt: new Date()
    });

    // Create Role Profile 1:1
    let profile = null;
    if (role === 'farmer') {
      const parsedCrops = Array.isArray(crops) ? crops : (crop ? [crop] : ['Samba Paddy']);
      const parsedArea = parseFloat(acres || landArea || 4.5);
      profile = await FarmerProfile.create({
        user: newUser._id,
        farmName: farmName || `${name.trim()}'s Farm`,
        district: district || 'Thanjavur',
        landArea: parsedArea > 0 ? parsedArea : 4.5,
        crops: parsedCrops,
        farmingType: 'Precision / Smart'
      });
    } else if (role === 'buyer') {
      profile = await BuyerProfile.create({
        user: newUser._id,
        businessName: businessName || `${name.trim()} Traders`,
        businessType: businessType || 'Wholesaler',
        district: district || 'Chennai',
        contactPerson: name.trim()
      });
    } else if (role === 'supplier') {
      profile = await SupplierProfile.create({
        user: newUser._id,
        businessName: businessName || `${name.trim()} Agri Services`,
        supplierType: supplierType || 'Machinery & Equipment Rental',
        district: district || 'Coimbatore',
        contactPerson: name.trim(),
        equipmentCategories: Array.isArray(equipmentCategories) ? equipmentCategories : ['Tractors', 'Harvesters & Threshers']
      });
    }

    // Generate JWT
    const token = generateJwtToken(newUser._id, newUser.role);

    return {
      user: sanitizeUser(newUser),
      profile,
      token
    };
  }

  // 2. User Login
  static async loginUser({ identifier, password, expectedRole }) {
    if (!identifier || !password) {
      throw new AppError('Please provide both email/mobile and password.', 400);
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');

    // Query user by email or mobile
    const userQuery = isEmail
      ? { email: cleanIdentifier.toLowerCase() }
      : { mobile: cleanIdentifier };

    const user = await User.findOne(userQuery);

    if (!user) {
      throw new AppError('Invalid email/mobile or password.', 401);
    }

    // Verify account active status
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // Compare password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email/mobile or password.', 401);
    }

    // Check optional expected portal role
    if (expectedRole && expectedRole !== user.role && user.role !== 'admin') {
      throw new AppError(
        `Portal access mismatch: This account is registered as '${user.role.toUpperCase()}'. Please use the ${user.role.toUpperCase()} Portal to log in.`,
        403
      );
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Load corresponding role profile
    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'buyer') {
      profile = await BuyerProfile.findOne({ user: user._id });
    } else if (user.role === 'supplier') {
      profile = await SupplierProfile.findOne({ user: user._id });
    }

    // Generate JWT
    const token = generateJwtToken(user._id, user.role);

    return {
      user: sanitizeUser(user),
      profile,
      token
    };
  }

  // 3. Get Current User Profile
  static async getCurrentUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'buyer') {
      profile = await BuyerProfile.findOne({ user: user._id });
    } else if (user.role === 'supplier') {
      profile = await SupplierProfile.findOne({ user: user._id });
    }

    return {
      user: sanitizeUser(user),
      profile
    };
  }
}

module.exports = AuthService;
