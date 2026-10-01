// VAYALX Main API Router (Phase 4 Connected Marketplace)
const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const cropListingRoutes = require('./cropListing.routes');
const orderRoutes = require('./order.routes');
const buyerDemandRoutes = require('./buyerDemand.routes');
const equipmentRoutes = require('./equipment.routes');
const bookingRoutes = require('./booking.routes');
const notificationRoutes = require('./notification.routes');
const farmRecordRoutes = require('./farmRecord.routes');
const prebookingRoutes = require('./prebooking.routes');
const communityRoutes = require('./community.routes');
const dashboardRoutes = require('./dashboard.routes');
const aiRoutes = require('./ai.routes');

const { requireAuth } = require('../middleware/auth.middleware');

// ── 1. Core Endpoints ──
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// ── 2. Marketplace & Domain Workflow Endpoints (Phase 4) ──
router.use('/listings', cropListingRoutes);
router.use('/orders', orderRoutes);
router.use('/demands', buyerDemandRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/farm-records', farmRecordRoutes);
router.use('/prebookings', prebookingRoutes);
router.use('/community', communityRoutes);
router.use('/', dashboardRoutes);

// ── 3. AI Pathology & Advisory Engine (Phase 5: Gemini AI) ──
router.use('/ai', aiRoutes);

// ── 4. External Services (Phase 6) ──
const weatherRoutes = require('./weather.routes');
const marketRoutes = require('./market.routes');
const schemesRoutes = require('./schemes.routes');

router.use('/weather', weatherRoutes);
router.use('/market', marketRoutes);
router.use('/schemes', schemesRoutes);

module.exports = router;
