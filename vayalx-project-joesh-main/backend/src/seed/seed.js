// VAYALX Demo Data Seed Script (Explicitly Triggered - Phase 2)
// Run with: node src/seed/seed.js

const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const {
  User,
  FarmerProfile,
  BuyerProfile,
  SupplierProfile,
  CropListing,
  BuyerDemand,
  Equipment,
  FarmRecord,
  CommunityPost,
  Notification
} = require('../models');

async function runSeed() {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('MongoDB connected.');

    logger.info('Clearing existing development data...');
    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      BuyerProfile.deleteMany({}),
      SupplierProfile.deleteMany({}),
      CropListing.deleteMany({}),
      BuyerDemand.deleteMany({}),
      Equipment.deleteMany({}),
      FarmRecord.deleteMany({}),
      CommunityPost.deleteMany({}),
      Notification.deleteMany({})
    ]);

    logger.info('Seeding Demo Users & Profiles...');

    // 1. Farmer User: Selvam R.
    const farmerUser = await User.create({
      name: 'Selvam R.',
      email: 'selvam.farmer@vayalx.demo',
      mobile: '9876543210',
      passwordHash: '$2a$10$DemoHashedPasswordPlaceholderForVayalX2026',
      role: 'farmer',
      isActive: true
    });

    await FarmerProfile.create({
      user: farmerUser._id,
      farmName: 'Cauvery Delta Green Farm',
      location: 'Thiruvaiyaru, Thanjavur',
      district: 'Thanjavur',
      state: 'Tamil Nadu',
      pincode: '613204',
      landArea: 4.5,
      landUnit: 'Acres',
      crops: ['Samba Paddy (Ponni / CO-51)', 'Robusta Banana (பூவன்)'],
      farmingType: 'Precision / Smart',
      experienceYears: 12
    });

    // 2. Buyer User: Sundaram Agro Exports
    const buyerUser = await User.create({
      name: 'Sundaram Agro Exports',
      email: 'sundaram.procurement@vayalx.demo',
      mobile: '9876543211',
      passwordHash: '$2a$10$DemoHashedPasswordPlaceholderForVayalX2026',
      role: 'buyer',
      isActive: true
    });

    await BuyerProfile.create({
      user: buyerUser._id,
      businessName: 'Sundaram Agro Exports Pvt Ltd',
      businessType: 'Exporter',
      location: 'Koyambedu APMC Hub, Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600092',
      contactPerson: 'K. Sundaram (Procurement Lead)',
      preferredCrops: ['Samba Paddy', 'Erode Turmeric', 'Country Tomato']
    });

    // 3. Supplier User: Tamil Agro Machinery & Drip Hub
    const supplierUser = await User.create({
      name: 'Tamil Agro Machinery Hub',
      email: 'tamilagro.rentals@vayalx.demo',
      mobile: '9876543212',
      passwordHash: '$2a$10$DemoHashedPasswordPlaceholderForVayalX2026',
      role: 'supplier',
      isActive: true
    });

    await SupplierProfile.create({
      user: supplierUser._id,
      businessName: 'Tamil Agro Farm Machinery Fleet',
      supplierType: 'Machinery & Equipment Rental',
      location: 'Pollachi Road, Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641021',
      contactPerson: 'M. Velusamy',
      equipmentCategories: ['Tractors', 'Harvesters & Threshers', 'Drone Sprayers']
    });

    logger.info('Seeding Marketplace Listings & Demands...');

    // 4. Crop Listing by Selvam
    await CropListing.create({
      farmer: farmerUser._id,
      cropName: 'Samba Paddy (Ponni / CO-51)',
      cropCategory: 'Paddy & Cereals',
      variety: 'CO-51 High Yielding',
      quantity: 50,
      quantityUnit: 'Quintals',
      price: 34,
      priceUnit: '₹/kg',
      location: 'Thiruvaiyaru, Thanjavur',
      quality: 'Grade A (Export Quality)',
      description: 'Harvested directly from Cauvery Delta basin with zero adulteration.',
      status: 'active'
    });

    // 5. Buyer Demand by Sundaram Agro
    await BuyerDemand.create({
      buyer: buyerUser._id,
      cropName: 'Country Tomato (நாட்டு தக்காளி)',
      cropCategory: 'Vegetables',
      requiredQuantity: 2000,
      quantityUnit: 'Kg',
      targetPrice: 35,
      deliveryLocation: 'Koyambedu Wholesale Terminal',
      requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      qualityRequirements: 'Fresh arrivals, uniform red grading, maximum 2% transit loss allowance',
      status: 'open'
    });

    // 6. Machinery Equipment by Tamil Agro
    await Equipment.create({
      supplier: supplierUser._id,
      name: 'John Deere 5050D 4WD Heavy Duty Tractor',
      category: 'Tractors',
      description: '50 HP Turbocharged tractor with 42-blade rotavator & hydraulic trolley attachment.',
      pricePerDay: 2800,
      pricePerHour: 450,
      availability: true,
      location: 'Coimbatore / Tiruppur Hub',
      district: 'Coimbatore',
      specifications: {
        hp: '50 HP',
        fuelType: 'Diesel',
        operatorIncluded: true,
        attachments: ['Rotavator', 'Disc Plough', 'Trolley']
      },
      status: 'available'
    });

    // 7. Farm Activity Record
    await FarmRecord.create({
      farmer: farmerUser._id,
      crop: 'Samba Paddy',
      activityType: 'fertilization',
      activityDate: new Date(),
      inputs: 'Panchagavya Organic Spray (3% dosage)',
      quantity: 15,
      quantityUnit: 'Liters',
      cost: 450,
      location: 'Cauvery North Field',
      notes: 'Applied early morning after de-weeding to boost tillering.'
    });

    // 8. Community Discussion Post
    await CommunityPost.create({
      author: farmerUser._id,
      authorName: 'Selvam R.',
      authorRole: 'farmer',
      title: 'நெல் பயிரில் இலைக்கருகல் கட்டுப்பாடு அனுபவம் (Blast Control Experience)',
      content: 'டெல்டா பகுதியில் இலைக்கருகல் வராமல் தடுக்க அதிகாலை நேரத்தில் 3% பஞ்சகாவ்யா அல்லது சூடோமோனாஸ் தெளிப்பது மிகச்சிறந்த பலன் அளிக்கிறது. அதிகப்படியான யூரியாவை தவிர்ப்பது நல்லது.',
      category: 'Organic Farming / பஞ்சகாவ்யா',
      status: 'active'
    });

    logger.info('✅ VAYALX Demo Seed Data generated successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Seed script error:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runSeed();
