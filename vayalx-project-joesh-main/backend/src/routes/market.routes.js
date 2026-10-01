const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { validateMarketQuery } = require('../validators/market.validator');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/prices', validateMarketQuery, marketController.getPrices);

module.exports = router;
