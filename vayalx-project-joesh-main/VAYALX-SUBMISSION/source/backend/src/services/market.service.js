const marketProvider = require('./external/market.provider');
const cache = require('../utils/cache');
const { generateSourceMetadata } = require('../utils/sourceMetadata');

class MarketService {
  constructor() {
    this.cacheTtl = parseInt(process.env.MARKET_CACHE_TTL_MS) || 1800000; // 30 mins
  }

  async getMarketPrices(filters) {
    const { commodity, state, district, market, date, limit } = filters;
    
    // Normalize and generate deterministic cache key
    const cacheKey = `market:${(commodity||'').toLowerCase()}:${(state||'').toLowerCase()}:${(district||'').toLowerCase()}:${(market||'').toLowerCase()}:${date||''}:${limit||100}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return {
        data: cachedData.data,
        source: generateSourceMetadata(cachedData.sourceName, cachedData.mode, true, { dataTimestamp: cachedData.dataTimestamp })
      };
    }

    try {
      const result = await marketProvider.getMarketPrices(filters);
      
      const validRecords = [];
      for (const record of result.records) {
        // Validate min <= modal <= max
        const minP = parseFloat(record.min_price);
        const maxP = parseFloat(record.max_price);
        const modalP = parseFloat(record.modal_price);

        if (!isNaN(minP) && !isNaN(maxP) && !isNaN(modalP)) {
          if (minP <= modalP && modalP <= maxP) {
            validRecords.push({
              commodity: record.commodity,
              market: record.market,
              district: record.district,
              state: record.state,
              date: record.arrival_date || record.date,
              minPrice: minP,
              maxPrice: maxP,
              modalPrice: modalP,
              unit: 'per quintal' // Assuming standard OGD unit
            });
          }
        }
      }

      const responseData = { prices: validRecords };
      const sourceName = result.source;
      const mode = result.mode;
      const dataTimestamp = new Date().toISOString(); // Typically the daily date of the dataset
      
      cache.set(cacheKey, { data: responseData, sourceName, mode, dataTimestamp }, this.cacheTtl);

      return {
        data: responseData,
        source: generateSourceMetadata(sourceName, mode, false, { dataTimestamp })
      };
    } catch (error) {
      const apiError = new Error('Market provider is temporarily unavailable.');
      apiError.code = 'MARKET_PROVIDER_UNAVAILABLE';
      apiError.status = 503;
      throw apiError;
    }
  }
}

module.exports = new MarketService();
