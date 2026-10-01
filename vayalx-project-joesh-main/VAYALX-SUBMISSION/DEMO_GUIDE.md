# VAYALX - Official Demo Guide

## Demo Accounts (Hackathon Mode)
The application is configured in "Hackathon Demo Mode" for quick evaluation. No OTP or passwords are required for these preset roles.
- **Farmer Profile:** Selvam R. (Direct access via `farmer-login.html`)
- **Buyer Profile:** Sundaram Agro Wholesale (Direct access via `buyer-login.html`)
- **Supplier Profile:** Rajan Implements (Direct access via `supplier-login.html`)

## Pre-Flight Check
1. Start MongoDB (`mongod`).
2. Run backend: `cd backend && npm install && npm start`.
3. Open `index.html` in browser.

## The 3-Minute Golden Path
1. **Landing Page (`index.html`)**
   - Note the clear communication of what VAYALX does.
2. **Farmer Dashboard (`farmer-login.html` -> `dashboard.html`)**
   - Click "Farmer Portal" and login as Selvam R.
   - Explore **Weather**, **Market Prices**, and **Schemes** tabs.
   - Click **Run AI Neural Diagnostic** under Crop Health to see Gemini multimodal analysis.
   - Click **+ New Crop Listing** and create a listing for Paddy.
3. **Buyer Dashboard (`buyer-login.html` -> `buyer-dashboard.html`)**
   - Open a new tab, navigate to Buyer Portal.
   - In the **Crop Marketplace**, locate Selvam's Paddy listing.
   - Click **Buy / Contract** and place an order.
4. **Farmer Notifications (Back to `dashboard.html`)**
   - Switch back to the Farmer tab.
   - See the incoming order request and **Accept** it.
   - Note that state management securely processes the transaction.

## Resiliency & Failure Recovery
VAYALX is designed to fail gracefully during the demonstration:
- **Gemini Failure:** If the API key is missing or fails, the backend switches to a predefined deterministic DEMO AI response.
- **Weather API Failure:** The UI will display a controlled unavailable state.
- **Database Restart:** Re-run `npm run seed:marketplace` to immediately restore all mock state and entities.
