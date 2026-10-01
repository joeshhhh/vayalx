const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemes.controller');
const { validateSchemesQuery, validateSchemeParam } = require('../validators/schemes.validator');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', validateSchemesQuery, schemesController.getSchemes);
router.get('/:id', validateSchemeParam, schemesController.getSchemeById);

module.exports = router;
