# VAYALX External Provider Register

| Provider | Purpose | Official URL | Endpoint | Credential Required? | Mode | Cache TTL | Timeout | Data Freshness | Attribution | Known Limitations |
|----------|---------|--------------|----------|----------------------|------|-----------|---------|----------------|-------------|-------------------|
| Open-Meteo | Agricultural weather forecasts & radar | https://open-meteo.com | /api/weather/... | No | LIVE | 10 mins | 8000ms | Real-time / Hourly updates | Powered by Open-Meteo | Does not provide hyper-local farm level (e.g. 10m grid) data. |
| India OGD / AGMARKNET | Daily wholesale mandi market prices | https://data.gov.in | /api/market/prices | Yes | DEMO/LIVE | 30 mins | 8000ms | Daily | Source: India OGD (AGMARKNET data) | Not tick-level real-time. Modal prices are daily aggregates. |
| myScheme | Government subsidies & farmer grants | https://www.myscheme.gov.in/ | /api/schemes | Yes | DEMO/LIVE | 24 hours | 8000ms | Daily/Weekly updates | Source: myScheme / Govt of Tamil Nadu | Eligibility logic requires official verification by nodal agencies. |

