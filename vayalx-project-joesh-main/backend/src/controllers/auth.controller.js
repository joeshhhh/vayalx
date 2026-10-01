// VAYALX Auth Controller (Phase 3)
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie, sanitizeUser } = require('../utils/auth.util');
const logger = require('../utils/logger');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  // Set HTTP-only Authentication Cookie
  setAuthCookie(res, result.token);

  logger.info(`New user registered successfully: [${result.user.role}] ${result.user.email}`);

  return ApiResponse.success(
    res,
    'Registration successful. Welcome to VAYALX!',
    {
      user: result.user,
      profile: result.profile
    },
    201
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, mobile, identifier, password, expectedRole, role } = req.body;
  const userIdentifier = identifier || email || mobile;

  const result = await AuthService.loginUser({
    identifier: userIdentifier,
    password,
    expectedRole: expectedRole || role
  });

  // Set HTTP-only Authentication Cookie
  setAuthCookie(res, result.token);

  logger.info(`User login successful: [${result.user.role}] ${result.user.email}`);

  return ApiResponse.success(
    res,
    `Welcome back, ${result.user.name}! Logged in as ${result.user.role.toUpperCase()}.`,
    {
      user: result.user,
      profile: result.profile
    },
    200
  );
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    'Current authenticated session loaded.',
    {
      user: sanitizeUser(req.user),
      profile: req.profile || null
    },
    200
  );
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  if (req.user) {
    logger.info(`User logged out: [${req.user.role}] ${req.user.email}`);
  }

  return ApiResponse.success(res, 'Logged out successfully from VAYALX session.', null, 200);
});

module.exports = {
  register,
  login,
  getMe,
  logout
};
