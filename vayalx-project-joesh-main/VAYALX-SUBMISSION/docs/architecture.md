# VAYALX Architecture

## Overview
VAYALX is built as a monolithic client-server application tailored for rapid hackathon deployment while maintaining strong security boundaries. It uses a vanilla HTML/JS frontend and a Node.js/Express backend, connected to a MongoDB database.

## System Components

### 1. Frontend Layer
- **Stack:** HTML5, CSS3, Vanilla JavaScript, DOM APIs.
- **Design:** Role-specific dashboards (`dashboard.html` for Farmer, `buyer-dashboard.html` for Buyer, `supplier-dashboard.html` for Supplier).
- **Communication:** Uses standard `fetch()` API calls to interact with backend endpoints. Stores no secrets client-side.

### 2. Backend Layer (Express API)
- **Framework:** Node.js with Express.
- **Role:** Handles routing, business logic, validation, authentication, and external service orchestration.
- **Middleware:** 
  - `auth.middleware.js`: Validates HttpOnly JWT cookies and enforces Role-Based Access Control (RBAC).
  - `error.middleware.js`: Standardizes error responses (e.g., 400 Bad Request, 403 Forbidden).

### 3. Database Layer (MongoDB)
- **ODM:** Mongoose.
- **Collections:** Users, FarmerProfiles, BuyerProfiles, SupplierProfiles, CropListings, PurchaseOrders, Equipments, EquipmentBookings, FarmRecords, Prebookings, Notifications, CommunityPosts.
- **Design:** Strict schema validation prevents NoSQL injection and enforces data integrity.

### 4. External Services
- **Google Gemini AI:** Multimodal API integration (`@google/genai`) for crop disease diagnosis and agronomy chat.
- **Weather API:** Integrates with Open-Meteo for localized forecasting.
- **Market Data:** Integrates with `api.data.gov.in` for daily mandi prices.
- **Govt Schemes:** Integrates with `myscheme.gov.in` structure for subsidies.

## Data Flow
```
User Action (Browser)
       ↓
Fetch API Call (Credentials: include)
       ↓
Express Router
       ↓
Validation (Zod/express-validator)
       ↓
Auth / RBAC Middleware
       ↓
Controller → Service Layer
       ↓
MongoDB (Mongoose) OR External API (Gemini/Weather/Market)
       ↓
JSON Response
       ↓
DOM Update
```
