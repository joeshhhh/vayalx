// VAYALX Crop Listing Routes (Phase 4)
const express = require('express');
const router = express.Router();
const cropListingController = require('../controllers/cropListing.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public / Authenticated Marketplace Listing Browse
router.get('/', cropListingController.getMarketplaceListings);

// Farmer Specific Actions
router.get('/my', requireAuth, requireRole('farmer', 'admin'), cropListingController.getMyListings);
router.post('/', requireAuth, requireRole('farmer', 'admin'), cropListingController.createListing);
router.get('/:id', cropListingController.getListingById);
router.patch('/:id', requireAuth, requireRole('farmer', 'admin'), cropListingController.updateListing);
router.delete('/:id', requireAuth, requireRole('farmer', 'admin'), cropListingController.deleteListing);

module.exports = router;
