const { query } = require('express-validator');
const validate = require('../middleware/validation.middleware');

exports.validateWeatherQuery = [
  query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('location').optional().isString().trim().isLength({ min: 2, max: 50 }).withMessage('Location must be 2-50 chars'),
  validate
];
