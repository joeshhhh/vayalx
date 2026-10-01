const weatherService = require('../services/weather.service');


exports.getCurrentOrForecast = async (req, res, next) => {
  try {
    const { latitude, longitude, location } = req.query;

    let result;
    if (latitude && longitude) {
      result = await weatherService.getForecastByCoordinates(latitude, longitude);
    } else if (location) {
      result = await weatherService.getForecastByLocation(location);
    } else {
      return res.status(400).json({ success: false, message: 'Provide latitude/longitude or location' });
    }

    // Adapt to standard VAYALX apiResponse format or custom JSON
    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source
    });
  } catch (error) {
    if (error.code === 'WEATHER_PROVIDER_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: { code: error.code }
      });
    }
    if (error.code === 'LOCATION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: { code: error.code }
      });
    }
    next(error);
  }
};
