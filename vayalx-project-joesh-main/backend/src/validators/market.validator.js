const { query } = require('express-validator');
const validate = require('../middleware/validation.middleware');

exports.validateMarketQuery = [
  query('commodity').optional().isString().trim(),
  query('state').optional().isString().trim(),
  query('district').optional().isString().trim(),
  query('market').optional().isString().trim(),
  query('date').optional().isISO8601().withMessage('Invalid date format'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
  validate
];
