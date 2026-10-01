// VAYALX Automated Mongoose Schema & Model Validator Tests (Phase 2)
const mongoose = require('mongoose');
const {
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
} = require('../models');

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

async function runModelTests() {
  console.log('\n🧪 Running VAYALX Mongoose Model Schema Validation Tests (Phase 2)...\n');

  const mockUserId = new mongoose.Types.ObjectId();
  const mockBuyerId = new mongoose.Types.ObjectId();
  const mockListingId = new mongoose.Types.ObjectId();
  const mockEquipId = new mongoose.Types.ObjectId();

  // ── 1. User Model Tests ──
  console.log('1️⃣ Testing User Model Schema:');
  const validUser = new User({
    name: 'Selvam R.',
    email: 'selvam@vayalx.demo',
    mobile: '9876543210',
    passwordHash: 'hashed_password_12345678',
    role: 'farmer'
  });
  const validUserErr = validUser.validateSync();
  assert(!validUserErr, 'Valid User passes validation');

  const invalidRoleUser = new User({
    name: 'Bad Role',
    email: 'bad@vayalx.demo',
    mobile: '9876543210',
    passwordHash: 'hashed_password_12345678',
    role: 'super_hacker'
  });
  const invalidRoleErr = invalidRoleUser.validateSync();
  assert(invalidRoleErr && invalidRoleErr.errors.role, 'Invalid role is rejected');

  const invalidEmailUser = new User({
    name: 'Bad Email',
    email: 'not-an-email',
    mobile: '9876543210',
    passwordHash: 'hashed_password_12345678',
    role: 'farmer'
  });
  const invalidEmailErr = invalidEmailUser.validateSync();
  assert(invalidEmailErr && invalidEmailErr.errors.email, 'Invalid email format is rejected');

  const invalidMobileUser = new User({
    name: 'Bad Mobile',
    email: 'mobile@vayalx.demo',
    mobile: '12345',
    passwordHash: 'hashed_password_12345678',
    role: 'farmer'
  });
  const invalidMobileErr = invalidMobileUser.validateSync();
  assert(invalidMobileErr && invalidMobileErr.errors.mobile, 'Invalid mobile number is rejected');

  // ── 2. FarmerProfile Model Tests ──
  console.log('\n2️⃣ Testing FarmerProfile Model:');
  const validFarmerProfile = new FarmerProfile({
    user: mockUserId,
    farmName: 'Cauvery Bio Farm',
    district: 'Thanjavur',
    landArea: 4.5,
    landUnit: 'Acres',
    crops: ['Paddy', 'Banana']
  });
  assert(!validFarmerProfile.validateSync(), 'Valid FarmerProfile passes validation');

  const invalidFarmerProfile = new FarmerProfile({
    user: mockUserId,
    landArea: -5
  });
  const invalidFarmerErr = invalidFarmerProfile.validateSync();
  assert(invalidFarmerErr && invalidFarmerErr.errors.landArea, 'Negative land area is rejected');

  // ── 3. BuyerProfile Model Tests ──
  console.log('\n3️⃣ Testing BuyerProfile Model:');
  const validBuyerProfile = new BuyerProfile({
    user: mockBuyerId,
    businessName: 'Sundaram Agro Exports',
    businessType: 'Exporter',
    district: 'Chennai'
  });
  assert(!validBuyerProfile.validateSync(), 'Valid BuyerProfile passes validation');

  const invalidBuyerProfile = new BuyerProfile({
    user: mockBuyerId,
    businessType: 'IllegalType'
  });
  const invalidBuyerErr = invalidBuyerProfile.validateSync();
  assert(invalidBuyerErr && invalidBuyerErr.errors.businessType, 'Invalid businessType is rejected');

  // ── 4. SupplierProfile Model Tests ──
  console.log('\n4️⃣ Testing SupplierProfile Model:');
  const validSupplierProfile = new SupplierProfile({
    user: mockUserId,
    businessName: 'Tamil Agro Machinery Hub',
    supplierType: 'Machinery & Equipment Rental',
    district: 'Coimbatore'
  });
  assert(!validSupplierProfile.validateSync(), 'Valid SupplierProfile passes validation');

  // ── 5. CropListing Model Tests ──
  console.log('\n5️⃣ Testing CropListing Model:');
  const validListing = new CropListing({
    farmer: mockUserId,
    cropName: 'Samba Ponni Paddy',
    quantity: 100,
    quantityUnit: 'Quintals',
    price: 34,
    location: 'Thanjavur APMC',
    status: 'active'
  });
  assert(!validListing.validateSync(), 'Valid CropListing passes validation');

  const invalidListingQty = new CropListing({
    farmer: mockUserId,
    cropName: 'Paddy',
    quantity: -10,
    price: 30,
    location: 'Thanjavur'
  });
  const invalidListingErr = invalidListingQty.validateSync();
  assert(invalidListingErr && invalidListingErr.errors.quantity, 'Negative quantity in CropListing is rejected');

  const invalidListingPrice = new CropListing({
    farmer: mockUserId,
    cropName: 'Paddy',
    quantity: 10,
    price: -50,
    location: 'Thanjavur'
  });
  const invalidPriceErr = invalidListingPrice.validateSync();
  assert(invalidPriceErr && invalidPriceErr.errors.price, 'Negative price in CropListing is rejected');

  const invalidListingStatus = new CropListing({
    farmer: mockUserId,
    cropName: 'Paddy',
    quantity: 10,
    price: 30,
    location: 'Thanjavur',
    status: 'invalid_status'
  });
  const invalidStatusErr = invalidListingStatus.validateSync();
  assert(invalidStatusErr && invalidStatusErr.errors.status, 'Invalid CropListing status is rejected');

  // ── 6. BuyerDemand Model Tests ──
  console.log('\n6️⃣ Testing BuyerDemand Model:');
  const validDemand = new BuyerDemand({
    buyer: mockBuyerId,
    cropName: 'Country Tomato',
    requiredQuantity: 500,
    quantityUnit: 'Kg',
    targetPrice: 35,
    deliveryLocation: 'Koyambedu',
    requiredBy: new Date(Date.now() + 86400000),
    status: 'open'
  });
  assert(!validDemand.validateSync(), 'Valid BuyerDemand passes validation');

  const invalidDemandQty = new BuyerDemand({
    buyer: mockBuyerId,
    cropName: 'Tomato',
    requiredQuantity: 0,
    targetPrice: 30,
    deliveryLocation: 'Koyambedu',
    requiredBy: new Date()
  });
  const invalidDemandErr = invalidDemandQty.validateSync();
  assert(invalidDemandErr && invalidDemandErr.errors.requiredQuantity, 'Zero/negative quantity in BuyerDemand is rejected');

  // ── 7. PurchaseOrder Model Tests ──
  console.log('\n7️⃣ Testing PurchaseOrder Model:');
  const validOrder = new PurchaseOrder({
    buyer: mockBuyerId,
    farmer: mockUserId,
    cropListing: mockListingId,
    cropName: 'Samba Paddy',
    quantity: 50,
    unitPrice: 32,
    totalAmount: 1600,
    deliveryLocation: 'Madurai Mandi',
    status: 'pending'
  });
  assert(!validOrder.validateSync(), 'Valid PurchaseOrder passes validation');

  const invalidOrderPrice = new PurchaseOrder({
    buyer: mockBuyerId,
    farmer: mockUserId,
    cropName: 'Paddy',
    quantity: 50,
    unitPrice: -20,
    totalAmount: 1000,
    deliveryLocation: 'Madurai'
  });
  const invalidOrderErr = invalidOrderPrice.validateSync();
  assert(invalidOrderErr && invalidOrderErr.errors.unitPrice, 'Negative unitPrice in PurchaseOrder is rejected');

  // ── 8. Equipment & EquipmentBooking Model Tests ──
  console.log('\n8️⃣ Testing Equipment & EquipmentBooking Models:');
  const validEquip = new Equipment({
    supplier: mockUserId,
    name: 'John Deere 5050D Tractor',
    category: 'Tractors',
    pricePerDay: 2500,
    location: 'Coimbatore Hub',
    status: 'available'
  });
  assert(!validEquip.validateSync(), 'Valid Equipment passes validation');

  const invalidEquipPrice = new Equipment({
    supplier: mockUserId,
    name: 'Tractor',
    category: 'Tractors',
    pricePerDay: -500,
    location: 'Coimbatore'
  });
  const invalidEquipErr = invalidEquipPrice.validateSync();
  assert(invalidEquipErr && invalidEquipErr.errors.pricePerDay, 'Negative pricePerDay in Equipment is rejected');

  const validBooking = new EquipmentBooking({
    equipment: mockEquipId,
    supplier: mockUserId,
    farmer: mockBuyerId,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-10-05'),
    durationDays: 4,
    totalAmount: 10000,
    deliveryLocation: 'Pollachi Field',
    status: 'pending'
  });
  assert(!validBooking.validateSync(), 'Valid EquipmentBooking passes validation');

  const invalidBookingDates = new EquipmentBooking({
    equipment: mockEquipId,
    supplier: mockUserId,
    farmer: mockBuyerId,
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-10-05'), // End before start
    durationDays: 1,
    totalAmount: 2500,
    deliveryLocation: 'Pollachi'
  });
  const invalidBookingErr = invalidBookingDates.validateSync();
  assert(invalidBookingErr && invalidBookingErr.errors.endDate, 'Invalid date range (endDate < startDate) is rejected');

  // ── 9. FarmRecord Model Tests ──
  console.log('\n9️⃣ Testing FarmRecord Model:');
  const validFarmRecord = new FarmRecord({
    farmer: mockUserId,
    crop: 'Turmeric',
    activityType: 'fertilization',
    cost: 1200
  });
  assert(!validFarmRecord.validateSync(), 'Valid FarmRecord passes validation');

  const invalidFarmRecordCost = new FarmRecord({
    farmer: mockUserId,
    crop: 'Turmeric',
    cost: -100
  });
  const invalidRecordErr = invalidFarmRecordCost.validateSync();
  assert(invalidRecordErr && invalidRecordErr.errors.cost, 'Negative cost in FarmRecord is rejected');

  // ── 10. Prebooking Model Tests ──
  console.log('\n🔟 Testing Prebooking Model:');
  const validPrebooking = new Prebooking({
    farmer: mockUserId,
    cropName: 'Turmeric (Finger Grade)',
    quantity: 10,
    expectedPrice: 160,
    expectedHarvestDate: new Date(Date.now() + 30 * 86400000),
    status: 'pending'
  });
  assert(!validPrebooking.validateSync(), 'Valid Prebooking passes validation');

  // ── 11. CommunityPost Model Tests ──
  console.log('\n1️⃣1️⃣ Testing CommunityPost Model:');
  const validPost = new CommunityPost({
    author: mockUserId,
    title: 'Precision Drip Fertigation Experience',
    content: 'Applying water soluble NPK through drip saves 40% fertilizer and gives 25% better yield.',
    category: 'Water & Irrigation',
    status: 'active'
  });
  assert(!validPost.validateSync(), 'Valid CommunityPost passes validation');

  // ── 12. Notification Model Tests ──
  console.log('\n1️⃣2️⃣ Testing Notification Model:');
  const validNotification = new Notification({
    recipient: mockUserId,
    type: 'order_created',
    title: 'New Purchase Order Received',
    message: 'Sundaram Agro placed an order for 50 Quintals Samba Paddy.'
  });
  assert(!validNotification.validateSync(), 'Valid Notification passes validation');

  const invalidNotifType = new Notification({
    recipient: mockUserId,
    type: 'unsupported_notification_type',
    title: 'Test',
    message: 'Test'
  });
  const invalidNotifErr = invalidNotifType.validateSync();
  assert(invalidNotifErr && invalidNotifErr.errors.type, 'Unsupported notification type is rejected');

  console.log(`\n========================================`);
  console.log(`🎉 TEST SUMMARY: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runModelTests();
