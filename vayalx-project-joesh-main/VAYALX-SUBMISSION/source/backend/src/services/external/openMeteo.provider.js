const fetchWithTimeout = require('../../utils/fetchWithTimeout');

class OpenMeteoProvider {
  constructor() {
    this.forecastUrl = process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast';
    this.geocodingUrl = process.env.OPEN_METEO_GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1/search';
    this.timeout = parseInt(process.env.EXTERNAL_API_TIMEOUT_MS) || 8000;
  }

  async getCoordinates(locationName) {
    const url = new URL(this.geocodingUrl);
    url.searchParams.append('name', locationName);
    url.searchParams.append('count', '1');
    url.searchParams.append('language', 'en');
    url.searchParams.append('format', 'json');

    const res = await fetchWithTimeout(url.toString(), { timeout: this.timeout });
    if (!res.ok) {
      throw new Error(`Open-Meteo geocoding error: ${res.status}`);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name
    };
  }

  async getForecast(latitude, longitude) {
    const url = new URL(this.forecastUrl);
    url.searchParams.append('latitude', latitude);
    url.searchParams.append('longitude', longitude);
    url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code');
    url.searchParams.append('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code');
    url.searchParams.append('timezone', 'Asia/Kolkata');
    url.searchParams.append('forecast_days', '7');

    const res = await fetchWithTimeout(url.toString(), { timeout: this.timeout });
    if (!res.ok) {
      throw new Error(`Open-Meteo forecast error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  }
}

module.exports = new OpenMeteoProvider();
