const fetchWithTimeout = require('../../utils/fetchWithTimeout');

class SchemesProvider {
  constructor() {
    this.mode = process.env.SCHEMES_MODE || 'DEMO';
    this.apiUrl = process.env.SCHEMES_API_URL || 'https://api.myscheme.gov.in/unknown';
    this.apiKey = process.env.SCHEMES_API_KEY || '';
    this.timeout = parseInt(process.env.EXTERNAL_API_TIMEOUT_MS) || 8000;
  }

  async getSchemes(filters) {
    if (this.mode === 'DEMO') {
      return this.getDemoData(filters);
    }

    if (!this.apiKey) {
      throw new Error('SCHEMES_API_KEY is not configured for LIVE mode');
    }

    const url = new URL(this.apiUrl);
    if (filters.state) url.searchParams.append('state', filters.state);
    if (filters.category) url.searchParams.append('category', filters.category);

    try {
      const res = await fetchWithTimeout(url.toString(), {
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Schemes provider returned ${res.status}`);
      }
      const data = await res.json();
      return {
        schemes: data.data || [],
        source: 'myScheme / API Setu',
        mode: 'LIVE'
      };
    } catch (error) {
      throw error;
    }
  }

  getDemoData(filters) {
    let schemes = [
      {
        id: 'SCH-PMKSY',
        name: 'PM Krishi Sinchayee Yojana (PMKSY) - Micro Irrigation',
        description: 'Subsidy for installing Drip & Sprinkler irrigation systems to improve water use efficiency.',
        benefits: ['Up to 100% subsidy for small/marginal farmers', 'Up to 75% for other farmers in Tamil Nadu'],
        eligibility: ['Must hold agricultural land', 'Priority for drought-prone areas'],
        documents: ['Chitta / Adangal', 'Aadhaar Card', 'Bank Passbook', 'Field Map'],
        applicationProcess: ['Register on Uzhavan App', 'Submit physical documents to Assistant Director of Agriculture'],
        applicationUrl: 'https://uzhavan.in',
        category: 'Irrigation',
        state: 'Tamil Nadu'
      },
      {
        id: 'SCH-KUSUM',
        name: 'PM-KUSUM Scheme (Solar Pumps)',
        description: 'Provide subsidies to farmers for installing standalone solar agriculture pumps.',
        benefits: ['70% subsidy on benchmark cost of solar pump'],
        eligibility: ['Individual farmers, FPOs', 'Water table must be safe'],
        documents: ['Aadhaar Card', 'Land Record', 'Bank Passbook'],
        applicationProcess: ['Apply via State Nodal Agency (TEDA in Tamil Nadu)'],
        applicationUrl: 'https://teda.in',
        category: 'Power',
        state: 'Tamil Nadu'
      },
      {
        id: 'SCH-FASAL',
        name: 'PM Fasal Bima Yojana (PMFBY)',
        description: 'Crop insurance scheme covering yield losses due to non-preventable risks.',
        benefits: ['Full insured amount coverage against natural calamities', 'Low premium (1.5% to 2%)'],
        eligibility: ['All farmers growing notified crops in notified areas'],
        documents: ['Land Records', 'Sowing Certificate', 'Aadhaar Card'],
        applicationProcess: ['Apply via PMFBY portal or CSCs'],
        applicationUrl: 'https://pmfby.gov.in',
        category: 'Insurance',
        state: 'Tamil Nadu'
      }
    ];

    if (filters.state) {
      schemes = schemes.filter(s => s.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.category) {
      schemes = schemes.filter(s => s.category.toLowerCase() === filters.category.toLowerCase());
    }

    return {
      schemes,
      source: 'VAYALX Demo Dataset',
      mode: 'DEMO'
    };
  }
}

module.exports = new SchemesProvider();
