// ── VAYALX Secure Upload Middleware (Phase 5) ──
// Uses in-memory storage (Buffer) to avoid permanent disk persistence.
const multer = require('multer');
const path = require('path');
const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } = require('../utils/imageValidator.util');
const { ValidationError } = require('../utils/error.util');

// Memory storage to process image in RAM
const storage = multer.memoryStorage();

// File filter based on extension & MIME type
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ValidationError(
        `Invalid file extension '${ext}'. Only ${ALLOWED_EXTENSIONS.join(', ')} files are accepted.`,
        [{ field: 'image', message: 'Invalid file extension' }]
      ),
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return cb(
      new ValidationError(
        `Invalid MIME type '${file.mimetype}'. Only JPEG, PNG, and WebP images are allowed.`,
        [{ field: 'image', message: 'Invalid image MIME type' }]
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1
  },
  fileFilter
});

/**
 * Single image upload middleware wrapper with friendly error handling
 */
const uploadCropImage = (req, res, next) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `Image is too large. Maximum allowed file size is 5 MB.`,
          error: 'LIMIT_FILE_SIZE'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: `Unexpected upload field. Please provide image in the 'image' field.`,
          error: 'LIMIT_UNEXPECTED_FILE'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        error: err.code
      });
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadCropImage
};
