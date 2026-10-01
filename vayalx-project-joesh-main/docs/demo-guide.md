# VAYALX - Official Hackathon Demo Guide

This guide details the exact steps to present VAYALX smoothly to a judging panel.

## 1. Preparation & Setup
Ensure the system is running from a clean state.
```bash
# 1. Install & configure
cd backend
npm install
cp ../.env.example .env
# Edit .env and supply a JWT_SECRET and GEMINI_API_KEY.

# 2. Seed deterministic demo data (Farmers, Buyers, Suppliers, Listings, Equipment)
npm run seed:marketplace

# 3. Start Backend
npm start

# 4. Start Frontend
npx serve .
```

## 2. The 3-Minute Demo Flow

### Step 1: The Landing Page
- Open `index.html` in the browser.
- **Talking Point**: VAYALX unifies a fragmented agricultural ecosystem by connecting Farmers directly to Buyers, Suppliers, AI intelligence, and live market data.

### Step 2: The Farmer Experience
- Click **Login as Farmer**. Use the seeded credentials (e.g., `farmer@vayalx.demo` / `password123`).
- **Talking Point**: The Farmer Dashboard provides everything needed to run a farm.
- **Action**: Show the Live Weather, Daily Mandi Prices, and Government Schemes widgets. Mention that these fetch from real APIs (Open-Meteo, data.gov.in) with automatic fallback.
- **Action**: Open the **AI Disease Detection** module. Upload a sample crop leaf image. Show how Google Gemini Multimodal AI processes the image and returns a structured diagnosis and confidence level.

### Step 3: Direct Marketplace (Farmer → Buyer)
- **Action**: Go to **Crop Management** and create a new Crop Listing.
- **Action**: Open a new browser tab/window and click **Login as Buyer** (`buyer@vayalx.demo` / `password123`).
- **Talking Point**: Buyers get direct access to verified farmers, eliminating middlemen.
- **Action**: See the newly created listing. Click "Purchase" and place an order.

### Step 4: Real-Time State & Notifications
- **Action**: Switch back to the Farmer tab.
- **Action**: Notice the Notification badge. Open it to see the new Purchase Order from the Buyer.
- **Action**: Click "Accept". Show that the system handles the state transition securely on the backend.
- **Action**: Switch to the Buyer tab and show the order status updated to "Accepted".

### Step 5: Equipment Hub (Farmer → Supplier)
- **Action**: From the Farmer tab, go to **Equipment Hub**.
- **Action**: Book a tractor or drone.
- **Action**: Log in as a **Supplier** (`supplier@vayalx.demo` / `password123`) to show the incoming booking and accept it.

## 3. Fallback / Emergency Recovery
- **AI Fails?**: If the Gemini API key is missing or quota is exceeded, the backend automatically switches to a deterministic `DEMO` mode and returns a safe response. The UI will explicitly display `(Simulated Demo)` as the source.
- **Market/Schemes Fails?**: The backend caches responses. If the cache expires and the external API is unreachable, it serves static fallback data and updates the source metadata to indicate the fallback.
- **MongoDB Fails?**: Check the terminal. Run `npm start` again.

## 4. Key Security Talking Points (If Asked)
- "How do you prevent a buyer from changing the price in the frontend?"
  *Answer:* The backend explicitly ignores client-provided pricing for transactions. It looks up the authoritative price from the Database `CropListing` schema and calculates the total server-side.
- "How do you protect cross-tenant data?"
  *Answer:* `checkResourceOwnership` middleware inspects the JWT identity and ensures users can only mutate resources they explicitly own.
