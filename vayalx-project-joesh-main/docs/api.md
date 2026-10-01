# VAYALX API Documentation

## Base URL
`/api`

## Authentication Endpoints
- **POST /auth/register**: Register a new user (Farmer, Buyer, Supplier).
- **POST /auth/login**: Login and receive an HttpOnly JWT cookie.
- **POST /auth/logout**: Clear the authentication cookie.
- **GET /auth/me**: Retrieve the authenticated user's profile and active role.

## Marketplace (Crop Listings & Orders)
- **GET /listings**: (Public) Browse available crop listings.
- **POST /listings**: (Farmer) Create a new crop listing.
- **DELETE /listings/:id**: (Farmer) Delete an owned crop listing.
- **POST /orders**: (Buyer) Place a purchase order for a listing.
- **PATCH /orders/:id/status**: (Farmer) Accept or reject an incoming order.

## Equipment & Bookings
- **GET /equipment**: (All) Browse available agricultural equipment.
- **POST /equipment**: (Supplier) Add a new equipment listing.
- **POST /bookings**: (Farmer) Create a booking request for an equipment.
- **PATCH /bookings/:id/status**: (Supplier) Accept or reject a booking request.

## Prebooking & Farm Records
- **POST /prebookings**: (Farmer) Generate an advance harvest pre-booking token.
- **GET /prebookings/my**: (Farmer) Retrieve all pre-bookings for the logged-in farmer.
- **GET /records**: (Farmer) Retrieve all farm financial ledger records.

## Notifications & Community
- **GET /notifications**: (Auth) Fetch user notifications.
- **PATCH /notifications/:id/read**: (Auth) Mark a notification as read.
- **GET /community/posts**: (Auth) Retrieve community forum posts.

## External & AI Services
- **POST /ai/diagnose**: (Auth) Upload a crop image (multipart/form-data) for Gemini disease diagnosis.
- **POST /ai/chat**: (Auth) Conversational agronomy AI request.
- **GET /weather/location**: (Auth) Fetch weather forecast for a specified district or coords.
- **GET /market/prices**: (Auth) Fetch daily mandi prices (Live or Demo).
- **GET /schemes**: (Auth) Fetch government schemes and subsidies.

## Health Check
- **GET /health**: Returns the system status including database connection, AI, Weather, Market, and Schemes modes.
