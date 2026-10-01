// VAYALX Authentication Request Validators (Phase 3)
const { body, oneOf } = require('express-validator');
const commonValidators = require('./common.validators');

const authValidators = {
  // Registration Validator
  register: [
    commonValidators.requiredString('name', 2, 100),
    commonValidators.email('email'),
    commonValidators.mobile('mobile'),
    commonValidators.password('password'),
    body('role')
      .trim()
      .isIn(['farmer', 'buyer', 'supplier'])
      .withMessage('Role must be one of: farmer, buyer, supplier (Admin registration is forbidden)')
  ],

  // Login Validator
  login: [
    body().custom((value, { req }) => {
      const identifier = req.body.identifier || req.body.email || req.body.mobile;
      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        throw new Error('Please provide an email or 10-digit mobile number');
      }
      return true;
    }),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

module.exports = authValidators;
