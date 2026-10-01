const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { validateWeatherQuery } = require('../validators/weather.validator');

// These routes can be accessed by the frontend directly for dashboards
router.get('/current', validateWeatherQuery, weatherController.getCurrentOrForecast);
router.get('/forecast', validateWeatherQuery, weatherController.getCurrentOrForecast);
router.get('/location', validateWeatherQuery, weatherController.getCurrentOrForecast);

module.exports = router;
