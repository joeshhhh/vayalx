// VAYALX Authentication & Token Utilities (Phase 3)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const BCRYPT_SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

async function comparePassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return await bcrypt.compare(plainPassword, passwordHash);
}

function generateJwtToken(userId, role) {
  const payload = {
    sub: userId.toString(),
    role: role
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

function verifyJwtToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: '/'
  };

  res.cookie(env.AUTH_COOKIE_NAME, token, cookieOptions);
}

function clearAuthCookie(res) {
  const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/'
  };

  res.clearCookie(env.AUTH_COOKIE_NAME, cookieOptions);
}

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  delete user.passwordHash;
  delete user.__v;

  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateJwtToken,
  verifyJwtToken,
  setAuthCookie,
  clearAuthCookie,
  sanitizeUser
};
