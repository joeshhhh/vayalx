const schemesProvider = require('./external/schemes.provider');
const cache = require('../utils/cache');
const { generateSourceMetadata } = require('../utils/sourceMetadata');

class SchemesService {
  constructor() {
    this.cacheTtl = parseInt(process.env.SCHEMES_CACHE_TTL_MS) || 86400000; // 24 hours
  }

  async getSchemes(filters) {
    const { state, category, search } = filters;
    const cacheKey = `schemes:${(state||'').toLowerCase()}:${(category||'').toLowerCase()}:${(search||'').toLowerCase()}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return {
        data: cachedData.data,
        source: generateSourceMetadata(cachedData.sourceName, cachedData.mode, true)
      };
    }

    try {
      const result = await schemesProvider.getSchemes({ state, category });
      let schemes = result.schemes;

      if (search) {
        const searchLower = search.toLowerCase();
        schemes = schemes.filter(s => 
          (s.name && s.name.toLowerCase().includes(searchLower)) || 
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }

      const responseData = { schemes };
      const sourceName = result.source;
      const mode = result.mode;
      
      cache.set(cacheKey, { data: responseData, sourceName, mode }, this.cacheTtl);

      return {
        data: responseData,
        source: generateSourceMetadata(sourceName, mode, false)
      };
    } catch (error) {
      const apiError = new Error('Schemes provider is temporarily unavailable.');
      apiError.code = 'SCHEMES_PROVIDER_UNAVAILABLE';
      apiError.status = 503;
      throw apiError;
    }
  }

  async getSchemeById(id) {
    // In a real implementation we might have a direct API call or just fetch all and filter
    const result = await this.getSchemes({});
    const scheme = result.data.schemes.find(s => s.id === id);
    if (!scheme) {
      const err = new Error('Scheme not found');
      err.code = 'SCHEME_NOT_FOUND';
      err.status = 404;
      throw err;
    }
    return {
      data: { scheme },
      source: result.source
    };
  }
}

module.exports = new SchemesService();
