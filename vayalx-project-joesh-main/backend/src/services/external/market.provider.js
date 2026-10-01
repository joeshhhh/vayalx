const fetchWithTimeout = require('../../utils/fetchWithTimeout');

class MarketProvider {
  constructor() {
    this.mode = process.env.MARKET_MODE || 'DEMO';
    this.apiUrl = process.env.MARKET_API_URL || 'https://api.data.gov.in/resource/unknown';
    this.apiKey = process.env.MARKET_API_KEY || '';
    this.timeout = parseInt(process.env.EXTERNAL_API_TIMEOUT_MS) || 8000;
  }

  async getMarketPrices(filters) {
    if (this.mode === 'DEMO') {
      return this.getDemoData(filters);
    }

    if (!this.apiKey) {
      throw new Error('MARKET_API_KEY is not configured for LIVE mode');
    }

    const url = new URL(this.apiUrl);
    url.searchParams.append('api-key', this.apiKey);
    url.searchParams.append('format', 'json');

    if (filters.state) url.searchParams.append('filters[state]', filters.state);
    if (filters.district) url.searchParams.append('filters[district]', filters.district);
    if (filters.market) url.searchParams.append('filters[market]', filters.market);
    if (filters.commodity) url.searchParams.append('filters[commodity]', filters.commodity);

    // Limit if needed, default to OGD limit or 100
    const limit = filters.limit || 100;
    url.searchParams.append('limit', limit);

    try {
      const res = await fetchWithTimeout(url.toString(), { timeout: this.timeout });
      if (!res.ok) {
        throw new Error(`Market provider returned ${res.status}`);
      }
      const data = await res.json();
      return {
        records: data.records || [],
        source: 'India OGD / AGMARKNET',
        mode: 'LIVE'
      };
    } catch (error) {
      // In a real app we might fallback to DEMO_FALLBACK if it's transient
      throw error;
    }
  }

  getDemoData(filters) {
    // Deterministic DEMO data based on the old hardcoded service, but formatted as requested
    let records = [
      { commodity: 'Paddy(Dhan)(Common)', market: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', date: '2026-09-30', min_price: 2300, max_price: 2500, modal_price: 2450 },
      { commodity: 'Banana', market: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', date: '2026-09-30', min_price: 350, max_price: 400, modal_price: 380 },
      { commodity: 'Tomato', market: 'Oddanchatram', district: 'Dindigul', state: 'Tamil Nadu', date: '2026-09-30', min_price: 2400, max_price: 3200, modal_price: 2800 },
      { commodity: 'Onion', market: 'Dindigul', district: 'Dindigul', state: 'Tamil Nadu', date: '2026-09-30', min_price: 4500, max_price: 5200, modal_price: 4800 },
      { commodity: 'Cotton', market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', date: '2026-09-30', min_price: 7500, max_price: 7800, modal_price: 7650 },
      { commodity: 'Turmeric', market: 'Erode', district: 'Erode', state: 'Tamil Nadu', date: '2026-09-30', min_price: 13500, max_price: 14000, modal_price: 13800 }
    ];

    if (filters.commodity) {
      records = records.filter(r => r.commodity.toLowerCase().includes(filters.commodity.toLowerCase()));
    }
    if (filters.state) {
      records = records.filter(r => r.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.district) {
      records = records.filter(r => r.district.toLowerCase() === filters.district.toLowerCase());
    }
    if (filters.market) {
      records = records.filter(r => r.market.toLowerCase() === filters.market.toLowerCase());
    }

    return {
      records,
      source: 'VAYALX Demo Dataset',
      mode: 'DEMO'
    };
  }
}

module.exports = new MarketProvider();
