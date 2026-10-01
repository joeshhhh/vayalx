const { query, param } = require('express-validator');
const validate = require('../middleware/validation.middleware');

exports.validateSchemesQuery = [
  query('state').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('search').optional().isString().trim(),
  validate
];

exports.validateSchemeParam = [
  param('id').isString().trim().notEmpty(),
  validate
];
