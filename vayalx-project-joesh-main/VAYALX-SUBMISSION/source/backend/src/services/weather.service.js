const openMeteoProvider = require('./external/openMeteo.provider');
const cache = require('../utils/cache');
const { generateSourceMetadata } = require('../utils/sourceMetadata');

class WeatherService {
  constructor() {
    this.cacheTtl = parseInt(process.env.WEATHER_CACHE_TTL_MS) || 600000; // 10 mins
  }

  async getForecastByCoordinates(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const cacheKey = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}:Asia/Kolkata`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        source: generateSourceMetadata('Open-Meteo', 'LIVE', true)
      };
    }

    try {
      const rawData = await openMeteoProvider.getForecast(lat, lon);
      
      const normalizedData = {
        location: {
          latitude: lat,
          longitude: lon
        },
        current: {
          temperature: rawData.current.temperature_2m,
          apparentTemperature: rawData.current.apparent_temperature,
          humidity: rawData.current.relative_humidity_2m,
          precipitation: rawData.current.precipitation,
          windSpeed: rawData.current.wind_speed_10m,
          weatherCode: rawData.current.weather_code
        },
        forecast: rawData.daily.time.map((time, index) => ({
          date: time,
          maxTemp: rawData.daily.temperature_2m_max[index],
          minTemp: rawData.daily.temperature_2m_min[index],
          precipitationSum: rawData.daily.precipitation_sum[index],
          precipitationProb: rawData.daily.precipitation_probability_max[index],
          weatherCode: rawData.daily.weather_code[index]
        }))
      };

      cache.set(cacheKey, normalizedData, this.cacheTtl);

      return {
        data: normalizedData,
        source: generateSourceMetadata('Open-Meteo', 'LIVE', false)
      };
    } catch (error) {
      const apiError = new Error('Weather service is temporarily unavailable.');
      apiError.code = 'WEATHER_PROVIDER_UNAVAILABLE';
      apiError.status = 503;
      throw apiError;
    }
  }

  async getForecastByLocation(locationName) {
    const cacheKey = `weather:loc:${locationName.toLowerCase().trim()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        source: generateSourceMetadata('Open-Meteo', 'LIVE', true)
      };
    }

    try {
      const coords = await openMeteoProvider.getCoordinates(locationName);
      if (!coords) {
        const err = new Error('Location not found');
        err.code = 'LOCATION_NOT_FOUND';
        err.status = 404;
        throw err;
      }

      const weatherResult = await this.getForecastByCoordinates(coords.latitude, coords.longitude);
      
      const result = {
        data: {
          ...weatherResult.data,
          location: { ...weatherResult.data.location, name: coords.name }
        },
        source: weatherResult.source
      };

      cache.set(cacheKey, result.data, this.cacheTtl);
      return result;
    } catch (error) {
      if (error.code === 'LOCATION_NOT_FOUND') throw error;
      const apiError = new Error('Weather service is temporarily unavailable.');
      apiError.code = 'WEATHER_PROVIDER_UNAVAILABLE';
      apiError.status = 503;
      throw apiError;
    }
  }
}

module.exports = new WeatherService();
