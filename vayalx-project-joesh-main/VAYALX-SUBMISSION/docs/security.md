# VAYALX Security Implementation

## 1. Authentication & Session Management
- **Stateless JWTs**: JSON Web Tokens are used for authentication.
- **HttpOnly Cookies**: JWTs are strictly delivered and read from an `HttpOnly` cookie (`vayalx_token`), completely preventing client-side JavaScript (and XSS attacks) from stealing the token.
- **Password Security**: Passwords are securely hashed with a salt using `bcryptjs` before storage.

## 2. Role-Based Access Control (RBAC)
- **`requireRole()` Middleware**: Restricts endpoints to specific account types (e.g., `requireRole('farmer')`). 
- **Privilege Separation**: A Buyer cannot access Farmer endpoints or vice-versa, verified at the API level (resulting in a `403 Forbidden`).

## 3. Resource Ownership Guard
- **`checkResourceOwnership` Middleware**: Prevents horizontal privilege escalation (IDOR/cross-tenant mutations).
- Example: If Farmer A tries to `DELETE /api/listings/:id` belonging to Farmer B, the backend verifies the `owner` field against `req.user._id` and rejects the request.

## 4. Input Validation & Mass Assignment Protection
- **Zod / Express-Validator**: All incoming payloads (`req.body`, `req.query`) are strictly validated against schemas.
- **Mass Assignment**: Financial fields (`totalAmount`, `status`) and ownership fields (`farmer`, `buyer`) are derived and set securely by the backend logic, never blindly applying `req.body` to a MongoDB document.

## 5. Security Headers & Protections
- **Helmet**: Secures Express apps by setting various HTTP headers (X-DNS-Prefetch-Control, X-Frame-Options, Strict-Transport-Security, etc.).
- **CORS**: Cross-Origin Resource Sharing is strictly configured to only allow requests from the designated `CLIENT_URL` with credentials.
- **Rate Limiting**: `express-rate-limit` prevents brute force and DDoS attacks on authentication and heavy external/AI routes.

## 6. Secret Management
- **No Leaked Keys**: API keys for Gemini, Market Data, and Schemes, as well as the MongoDB URI and JWT Secret, are stored exclusively in `.env` and are strictly evaluated on backend startup. 
- **Test Integrity**: Test suites explicitly verify that sensitive identifiers (e.g., Google API keys, `AIza...`) are never leaked in JSON responses or errors.
