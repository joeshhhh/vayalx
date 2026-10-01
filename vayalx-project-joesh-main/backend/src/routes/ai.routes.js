// ── VAYALX AI Diagnostic & Agronomy Routes (Phase 5) ──
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');
const { uploadCropImage } = require('../middleware/upload.middleware');
const aiController = require('../controllers/ai.controller');

/**
 * @route   POST /api/ai/diagnose
 * @desc    Upload crop image for server-side Gemini multimodal disease analysis
 * @access  Private (Authenticated Users)
 */
router.post('/diagnose', requireAuth, aiLimiter, uploadCropImage, aiController.diagnoseCrop);

/**
 * @route   POST /api/ai/chat
 * @desc    Conversational AI farming advice using Gemini
 * @access  Private (Authenticated Users)
 */
router.post('/chat', requireAuth, aiLimiter, aiController.chatAdvisor);

module.exports = router;
