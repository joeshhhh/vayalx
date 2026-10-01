# VAYALX - Connected Smart Agriculture Ecosystem

**VAYALX** is a connected digital platform bringing together Farmers, Buyers, Suppliers, AI assistance, and External agricultural information into one cohesive ecosystem. It addresses the fragmentation in the agricultural sector by providing a unified solution for crop management, direct market access, equipment rental, and intelligent agronomy advisory.

## Problem
The agricultural ecosystem is deeply fragmented. Farmers struggle to access reliable crop disease diagnosis, fair market prices, up-to-date government schemes, and affordable farm equipment. Buyers lack direct access to verified farmers for procurement, and equipment suppliers face challenges in efficiently leasing their machinery.

## Solution
VAYALX bridges these gaps through a three-role marketplace integrated with AI and live data services:
* **Farmer:** Manage crop listings, pre-book harvests, rent equipment, view weather/market prices/schemes, and diagnose crop diseases via AI.
* **Buyer:** Browse available crops, place direct purchase orders, post counter-demands, and interact directly with farmers.
* **Supplier:** Manage an inventory of agricultural equipment and accept or reject booking requests from farmers.

## Core Features (Phase 1–9 Implemented)
- **Role-Based Access Control (RBAC):** Secure authentication for Farmers, Buyers, and Suppliers.
- **Marketplace Workflows:** End-to-end purchasing (Farmer ↔ Buyer) and equipment booking (Farmer ↔ Supplier) with transactional consistency.
- **AI Crop Diagnosis:** Real-time multimodal (image + text) disease analysis and conversational agronomy advice powered by Google Gemini.
- **External Data Hub:** Live/Cached Weather (Open-Meteo), Daily Mandi Market Prices, and Government Schemes.
- **Notifications:** Real-time event dispatching for orders, bookings, and platform activity.
- **Data Privacy & Security:** JWT HttpOnly cookies, MongoDB injection protection, and strict resource ownership boundaries.

## Architecture
```
               VAYALX
                  |
        +---------+---------+
        |                   |
     Frontend             Backend
        |                   |
   Role Dashboards      Express API
                            |
          +-----------------+------------------+
          |                 |                  |
       MongoDB           Gemini          External APIs
                                            |
                                  Weather / Market / Schemes
```

## Technology Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3, DOM APIs (No heavy frameworks, fast & responsive).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose.
- **AI Integration:** Google Gemini Multimodal API (`@google/genai`).
- **Security:** bcryptjs, jsonwebtoken, express-rate-limit, helmet, Zod schema validation.

## Setup & Run

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or via Atlas.

### 2. Environment Configuration
Copy `.env.example` to `backend/.env` (or root `.env` if loading centrally) and configure it. **A `JWT_SECRET` must be set.**

```bash
cp .env.example backend/.env
```

### 3. Installation
```bash
cd backend
npm install
```

### 4. Running the Project
**Start both local services together:**
```bash
npm run local
```
Then open `http://localhost:3000`. This starts the frontend on port 3000 and the API on port 5000 with local demo-mode defaults. MongoDB must be running locally.

**Start the Backend API:**
```bash
cd backend
npm start
```
*Note: The backend runs on port 5000 by default. It provides a health check at `/api/health`.*

**Run the Frontend:**
Open the `index.html` file in your browser, or use a static file server:
```bash
npx serve .
```

### 5. Testing
The test suite covers authentication, model validation, marketplace workflows, AI diagnosis validation, and security constraints.
```bash
cd backend
npm test
```

### 6. Demo Seeding
To populate the database with a deterministic demo dataset (Farmer, Buyer, Supplier, Listings, Equipment):
```bash
cd backend
npm run seed:marketplace
```

## API Documentation Overview
| Area | Path | Role | Description |
|---|---|---|---|
| **Auth** | `POST /api/auth/register` | Public | Register a new user |
| **Auth** | `POST /api/auth/login` | Public | Login and receive HttpOnly cookie |
| **Listings** | `GET /api/listings` | All | Browse crop listings |
| **Orders** | `POST /api/orders` | Buyer | Place a purchase order |
| **AI** | `POST /api/ai/diagnose` | Auth | Diagnose crop image using Gemini |
| **Weather** | `GET /api/weather/location` | Auth | Get current weather & forecast |
| **Market** | `GET /api/market/prices` | Auth | Get daily mandi prices |
| **Schemes** | `GET /api/schemes` | Auth | Get govt schemes & subsidies |

*Note: All protected routes enforce JWT verification and Role-Based Access Control.*

## AI & External Services Strategy (LIVE / DEMO Modes)
VAYALX provides resilient fallback mechanisms suitable for hackathon demonstrations:
- **AI Mode:** Configure `AI_MODE=LIVE` or `DEMO`. If no valid API key is present, the system defaults to deterministic DEMO diagnosis, preventing demo failure.
- **Market / Schemes:** Configure `MARKET_MODE=LIVE` or `DEMO`. Data is cached according to TTL settings. If providers are unreachable, the API falls back cleanly.

## Security Controls
- **Zero Secret Exposure:** Strict sanitization ensures AI keys, passwords, and sensitive system tokens are never leaked to the client.
- **Mass Assignment Protection:** Controllers validate explicit fields before updating MongoDB documents.
- **Ownership Verification:** A user cannot modify or delete resources owned by another user.
- **Rate Limiting:** Distinct rate limits applied to auth endpoints, AI processing, and external data requests.

## Known Limitations
- Caching is currently in-memory (Prototype scale) and resets upon server restart.
- Transaction handling across multiple collections uses simplified non-atomic sequential saves; an enterprise version would require MongoDB Replica Set transactions.
- Live market data accuracy is dependent on external provider availability (data.gov.in).

---
**Hackathon Readiness Status:** VAYALX — HACKATHON READY
