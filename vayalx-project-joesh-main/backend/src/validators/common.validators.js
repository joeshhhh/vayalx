// VAYALX Common Field Validators Foundation
const { body, param, query } = require('express-validator');

const commonValidators = {
  // Email validator
  email: (fieldName = 'email') =>
    body(fieldName)
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

  // Mobile validator (Indian 10-digit format standard)
  mobile: (fieldName = 'mobile') =>
    body(fieldName)
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit Indian mobile number starting with 6-9'),

  // Password validator
  password: (fieldName = 'password') =>
    body(fieldName)
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),

  // User Role validator (Farmer, Buyer, Supplier, Admin)
  role: (fieldName = 'role') =>
    body(fieldName)
      .trim()
      .isIn(['farmer', 'buyer', 'supplier', 'admin'])
      .withMessage('Role must be one of: farmer, buyer, supplier, admin'),

  // Positive Price validator
  price: (fieldName = 'price') =>
    body(fieldName)
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive numeric value'),

  // Positive Quantity validator
  quantity: (fieldName = 'quantity') =>
    body(fieldName)
      .isFloat({ min: 0.01 })
      .withMessage('Quantity must be greater than 0'),

  // MongoDB ObjectId param validator
  objectIdParam: (paramName = 'id') =>
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid identifier format for ${paramName}`),

  // Status validator
  status: (fieldName = 'status', allowedStatuses = ['active', 'pending', 'completed', 'cancelled']) =>
    body(fieldName)
      .trim()
      .isIn(allowedStatuses)
      .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),

  // Required String validator with length constraints
  requiredString: (fieldName, min = 1, max = 255) =>
    body(fieldName)
      .trim()
      .notEmpty()
      .withMessage(`${fieldName} is required`)
      .isLength({ min, max })
      .withMessage(`${fieldName} must be between ${min} and ${max} characters`)
};

module.exports = commonValidators;
