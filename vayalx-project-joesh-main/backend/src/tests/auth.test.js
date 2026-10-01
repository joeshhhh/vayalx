// VAYALX Automated Authentication & RBAC Test Suite (Phase 3)
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');

const env = require('../config/env');
const {
  hashPassword,
  comparePassword,
  generateJwtToken,
  verifyJwtToken,
  sanitizeUser
} = require('../utils/auth.util');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole, checkResourceOwnership } = require('../middleware/role.middleware');
const { User, FarmerProfile, CropListing } = require('../models');
const AuthService = require('../services/auth.service');
const errorHandler = require('../middleware/error.middleware');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runAuthTests() {
  console.log('\n🧪 Running VAYALX Phase 3 Authentication & RBAC Test Suite...\n');

  // ── 1. PASSWORD HASHING & BCRYPT TESTS ──
  console.log('1️⃣ Testing Password Hashing & Encryption (bcryptjs):');
  const plainPass = 'FarmerPass2026!';
  const hashed = await hashPassword(plainPass);
  assert(hashed && hashed.startsWith('$2a$'), 'Password is encrypted using bcrypt hash ($2a$ format)');
  assert(hashed !== plainPass, 'Password is NEVER stored in plaintext');

  const isMatchValid = await comparePassword(plainPass, hashed);
  assert(isMatchValid === true, 'Valid password matches bcrypt hash');

  const isMatchInvalid = await comparePassword('WrongPassword123!', hashed);
  assert(isMatchInvalid === false, 'Invalid password is rejected');

  try {
    await hashPassword('short');
    assert(false, 'Weak password under 8 chars should throw error');
  } catch (err) {
    assert(true, 'Weak password under 8 chars is rejected before hashing');
  }

  // ── 2. JWT TOKEN GENERATION & SIGNATURE TESTS ──
  console.log('\n2️⃣ Testing JWT Token Lifecycle & Security:');
  const mockUserId = new mongoose.Types.ObjectId();
  const token = generateJwtToken(mockUserId, 'farmer');
  assert(token && typeof token === 'string' && token.split('.').length === 3, 'JWT token is generated with header.payload.signature structure');

  const decoded = verifyJwtToken(token);
  assert(decoded.sub === mockUserId.toString() && decoded.role === 'farmer', 'JWT token decoded successfully and preserves identity claim');

  try {
    verifyJwtToken('forged.jwt.token.signature');
    assert(false, 'Forged JWT signature should throw');
  } catch (err) {
    assert(true, 'Forged or tampered JWT signature is rejected');
  }

  // ── 3. SANITIZATION TESTS ──
  console.log('\n3️⃣ Testing User Response Sanitization:');
  const rawUserObj = {
    _id: mockUserId,
    name: 'Selvam R.',
    email: 'selvam@vayalx.demo',
    mobile: '9876543210',
    passwordHash: '$2a$10$SecretPasswordHashThatMustNeverLeak',
    role: 'farmer',
    isActive: true,
    lastLoginAt: new Date()
  };
  const sanitized = sanitizeUser(rawUserObj);
  assert(sanitized.passwordHash === undefined, 'passwordHash is stripped from sanitized user output');
  assert(sanitized.id === mockUserId.toString(), 'User id is formatted as clean string');
  assert(sanitized.role === 'farmer', 'Role is preserved');

  // ── 4. RBAC MIDDLEWARE TESTS ──
  console.log('\n4️⃣ Testing Server-Side RBAC Middleware (requireRole):');

  const testApp = express();
  testApp.use(express.json());

  // Mock authenticated user middleware for isolation
  let mockAuthUser = { _id: mockUserId, role: 'farmer', isActive: true };
  testApp.use((req, res, next) => {
    req.user = mockAuthUser;
    next();
  });

  // Endpoints with role guards
  testApp.get('/test-farmer-only', requireRole('farmer'), (req, res) => res.json({ success: true, route: 'farmer' }));
  testApp.get('/test-buyer-only', requireRole('buyer'), (req, res) => res.json({ success: true, route: 'buyer' }));
  testApp.get('/test-supplier-only', requireRole('supplier'), (req, res) => res.json({ success: true, route: 'supplier' }));
  testApp.get('/test-admin-only', requireRole('admin'), (req, res) => res.json({ success: true, route: 'admin' }));
  testApp.get('/test-multi-role', requireRole('farmer', 'buyer', 'admin'), (req, res) => res.json({ success: true, route: 'multi' }));
  testApp.use(errorHandler);

  const server = testApp.listen(5093);
  const TEST_URL = 'http://localhost:5093';

  // 4.1 Farmer accessing Farmer endpoint
  mockAuthUser = { _id: mockUserId, role: 'farmer', isActive: true };
  const resFtoF = await fetch(`${TEST_URL}/test-farmer-only`);
  assert(resFtoF.status === 200, 'Farmer can access farmer-protected route (HTTP 200)');

  // 4.2 Farmer accessing Buyer endpoint -> Forbidden 403
  const resFtoB = await fetch(`${TEST_URL}/test-buyer-only`);
  assert(resFtoB.status === 403, 'Farmer is forbidden from buyer-protected route (HTTP 403)');

  // 4.3 Farmer accessing Supplier endpoint -> Forbidden 403
  const resFtoS = await fetch(`${TEST_URL}/test-supplier-only`);
  assert(resFtoS.status === 403, 'Farmer is forbidden from supplier-protected route (HTTP 403)');

  // 4.4 Farmer accessing Admin endpoint -> Forbidden 403
  const resFtoA = await fetch(`${TEST_URL}/test-admin-only`);
  assert(resFtoA.status === 403, 'Farmer is forbidden from admin-protected route (HTTP 403)');

  // 4.5 Buyer accessing Buyer endpoint
  mockAuthUser = { _id: new mongoose.Types.ObjectId(), role: 'buyer', isActive: true };
  const resBtoB = await fetch(`${TEST_URL}/test-buyer-only`);
  assert(resBtoB.status === 200, 'Buyer can access buyer-protected route (HTTP 200)');

  // 4.6 Buyer accessing Farmer endpoint -> Forbidden 403
  const resBtoF = await fetch(`${TEST_URL}/test-farmer-only`);
  assert(resBtoF.status === 403, 'Buyer is forbidden from farmer-protected route (HTTP 403)');

  // 4.7 Admin accessing multi-role endpoint
  mockAuthUser = { _id: new mongoose.Types.ObjectId(), role: 'admin', isActive: true };
  const resAtoM = await fetch(`${TEST_URL}/test-multi-role`);
  assert(resAtoM.status === 200, 'Admin can access multi-role protected routes (HTTP 200)');

  // ── 5. RESOURCE OWNERSHIP MIDDLEWARE TESTS ──
  console.log('\n5️⃣ Testing Resource Ownership Guard (checkResourceOwnership):');

  const farmerAId = new mongoose.Types.ObjectId();
  const farmerBId = new mongoose.Types.ObjectId();

  const ownApp = express();
  ownApp.use(express.json());
  let currentOwnUser = { _id: farmerBId, role: 'farmer' };

  ownApp.use((req, res, next) => {
    req.user = currentOwnUser;
    next();
  });

  // Mock model getter for testing
  const mockResourceMap = {
    'listing101': { _id: 'listing101', farmer: farmerAId, cropName: 'Paddy' }
  };
  const mockModelGetter = () => ({
    findById: async (id) => mockResourceMap[id] || null
  });

  ownApp.delete('/test-listings/:id', checkResourceOwnership(mockModelGetter, 'farmer', 'id'), (req, res) => {
    res.json({ success: true, message: 'Resource modified by owner' });
  });
  ownApp.use(errorHandler);

  const ownServer = ownApp.listen(5092);

  // Farmer B attempts to modify Farmer A's listing
  currentOwnUser = { _id: farmerBId, role: 'farmer' };
  const attackRes = await fetch('http://localhost:5092/test-listings/listing101', { method: 'DELETE' });
  assert(attackRes.status === 403, 'Cross-tenant mutation rejected: Farmer B cannot delete Farmer A resource (HTTP 403)');

  // Farmer A modifies own listing
  currentOwnUser = { _id: farmerAId, role: 'farmer' };
  const ownerRes = await fetch('http://localhost:5092/test-listings/listing101', { method: 'DELETE' });
  assert(ownerRes.status === 200, 'Resource owner is permitted to perform mutation (HTTP 200)');

  // Admin modifies listing (admin bypass)
  currentOwnUser = { _id: new mongoose.Types.ObjectId(), role: 'admin' };
  const adminOwnRes = await fetch('http://localhost:5092/test-listings/listing101', { method: 'DELETE' });
  assert(adminOwnRes.status === 200, 'Admin role bypasses individual ownership check (HTTP 200)');

  // ── 6. REGISTRATION RULES & ADMIN SELF-REGISTRATION PREVENTION ──
  console.log('\n6️⃣ Testing Registration Security Rules:');

  // Test admin self-registration rejection
  try {
    await AuthService.registerUser({
      name: 'Hacker',
      email: 'hacker@vayalx.demo',
      mobile: '9876543299',
      password: 'HackerPass123!',
      role: 'admin'
    });
    assert(false, 'Admin self-registration should fail');
  } catch (err) {
    assert(err.statusCode === 400 && err.message.includes('admin is prohibited'), 'AuthService rejects public admin registration with HTTP 400');
  }

  // Test invalid role rejection
  try {
    await AuthService.registerUser({
      name: 'Unknown Role',
      email: 'unknown@vayalx.demo',
      mobile: '9876543299',
      password: 'Pass12345678!',
      role: 'super_hacker'
    });
    assert(false, 'Invalid role should fail');
  } catch (err) {
    assert(err.statusCode === 400, 'AuthService rejects unsupported roles with HTTP 400');
  }

  server.close();
  ownServer.close();

  console.log(`\n========================================`);
  console.log(`🎉 PHASE 3 TEST SUMMARY: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthTests();
