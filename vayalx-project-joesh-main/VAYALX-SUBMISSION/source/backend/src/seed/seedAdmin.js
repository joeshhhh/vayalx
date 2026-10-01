// VAYALX Secure Admin User Seed Script (Phase 3)
// Run with: node src/seed/seedAdmin.js

const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/auth.util');
const { User } = require('../models');

async function seedAdminUser() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vayalx.internal').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin#VayalX$2026';
    const adminMobile = (process.env.ADMIN_MOBILE || '9876543299').trim();
    const adminName = process.env.ADMIN_NAME || 'VAYALX Platform Admin';

    logger.info(`Connecting to MongoDB to provision Administrator: ${adminEmail}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      logger.info(`Admin user [${adminEmail}] already exists. Updating password...`);
      adminUser.passwordHash = await hashPassword(adminPassword);
      adminUser.role = 'admin';
      adminUser.isActive = true;
      await adminUser.save();
    } else {
      const passwordHash = await hashPassword(adminPassword);
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        mobile: adminMobile,
        passwordHash,
        role: 'admin',
        isActive: true
      });
      logger.info(`✅ Administrator account created successfully: [ID: ${adminUser._id}]`);
    }

    logger.info(`🎉 Admin account [${adminEmail}] is ready for Phase 3/4 testing.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Failed to seed admin user:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedAdminUser();
