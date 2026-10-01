// ── VAYALX AI Controller (Phase 5) ──
// Orchestrates image buffer validation, contextual sanitization, and Gemini service execution.

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { ValidationError, ApiError } = require('../utils/error.util');
const { inspectImageBuffer } = require('../utils/imageValidator.util');
const aiService = require('../services/ai.service');

/**
 * @desc    Diagnose crop pathology from uploaded leaf/crop image
 * @route   POST /api/ai/diagnose
 * @access  Private (Authenticated Users: Farmer / All Roles)
 */
const diagnoseCrop = asyncHandler(async (req, res) => {
  // 1. Verify file presence
  if (!req.file || !req.file.buffer) {
    throw new ValidationError('Please upload a crop image to diagnose.', [
      { field: 'image', message: 'Crop image file is required.' }
    ]);
  }

  // 2. Perform deep buffer inspection (magic bytes, format, dimension boundaries)
  const imageInspection = inspectImageBuffer(req.file.buffer);
  if (!imageInspection.valid) {
    throw new ValidationError(imageInspection.error || 'Invalid or corrupted image file.', [
      { field: 'image', message: imageInspection.error || 'Image failed security inspection.' }
    ]);
  }

  // 3. Extract and sanitize optional contextual metadata
  const { cropName = '', location = '', additionalNotes = '' } = req.body;

  // 4. Invoke Gemini AI Multimodal Service
  const result = await aiService.analyzeCropImage({
    imageBuffer: req.file.buffer,
    mimeType: req.file.mimetype || `image/${imageInspection.format}`,
    cropName: typeof cropName === 'string' ? cropName.trim() : '',
    location: typeof location === 'string' ? location.trim() : '',
    additionalNotes: typeof additionalNotes === 'string' ? additionalNotes.trim() : ''
  });

  return ApiResponse.success(res, 'Crop image analyzed successfully', {
    diagnosis: result.diagnosis,
    source: result.source
  });
});

/**
 * @desc    Chat with VAYALX Agronomist Assistant
 * @route   POST /api/ai/chat
 * @access  Private (Authenticated Users)
 */
const chatAdvisor = asyncHandler(async (req, res) => {
  const { message, history = [], language = 'auto' } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new ValidationError('Message text is required.', [
      { field: 'message', message: 'Message cannot be empty.' }
    ]);
  }

  const result = await aiService.chatAgronomist({
    message: message.trim(),
    history: Array.isArray(history) ? history : [],
    language
  });

  return ApiResponse.success(res, 'AI Advisory reply generated', result);
});

module.exports = {
  diagnoseCrop,
  chatAdvisor
};
