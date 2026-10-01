// VAYALX Central Mongoose Models Registry (Phase 2)

const User = require('./User');
const FarmerProfile = require('./FarmerProfile');
const BuyerProfile = require('./BuyerProfile');
const SupplierProfile = require('./SupplierProfile');
const CropListing = require('./CropListing');
const BuyerDemand = require('./BuyerDemand');
const PurchaseOrder = require('./PurchaseOrder');
const Equipment = require('./Equipment');
const EquipmentBooking = require('./EquipmentBooking');
const FarmRecord = require('./FarmRecord');
const Prebooking = require('./Prebooking');
const CommunityPost = require('./CommunityPost');
const Notification = require('./Notification');

module.exports = {
  User,
  FarmerProfile,
  BuyerProfile,
  SupplierProfile,
  CropListing,
  BuyerDemand,
  PurchaseOrder,
  Equipment,
  EquipmentBooking,
  FarmRecord,
  Prebooking,
  CommunityPost,
  Notification
};
