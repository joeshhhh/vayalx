// VAYALX Dashboard & Market KPI Routes (Phase 4)
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Role Dashboard Summaries (Real MongoDB Metrics)
router.get('/farmers/dashboard', requireAuth, requireRole('farmer', 'admin'), dashboardController.getFarmerDashboard);
router.get('/buyers/dashboard', requireAuth, requireRole('buyer', 'admin'), dashboardController.getBuyerDashboard);
router.get('/suppliers/dashboard', requireAuth, requireRole('supplier', 'admin'), dashboardController.getSupplierDashboard);

// Daily TN Mandi Benchmarks
router.get('/market/daily-rates', dashboardController.getDailyMandiRates);

module.exports = router;
