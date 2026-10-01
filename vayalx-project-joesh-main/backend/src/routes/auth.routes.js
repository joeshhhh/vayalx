// VAYALX Authentication Routes (Phase 3)
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validators');
const validate = require('../middleware/validation.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

// Public Auth Endpoints (Protected by Auth Rate Limiter)
router.post('/register', authLimiter, authValidators.register, validate, authController.register);
router.post('/login', authLimiter, authValidators.login, validate, authController.login);
router.post('/logout', authController.logout);

// Protected Auth Endpoints (Requires Active JWT Session)
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
