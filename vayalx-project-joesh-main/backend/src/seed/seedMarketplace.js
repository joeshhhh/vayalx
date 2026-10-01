// VAYALX Marketplace Demo Seeder (Phase 4)
require('dotenv').config();
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
const { hashPassword } = require('../utils/auth.util');
const env = require('../config/env');

async function seedMarketplace() {
  console.log('🌱 Starting VAYALX Phase 4 Marketplace Data Seeder...');

  if (!env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not configured in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('📦 Connected to MongoDB:', mongoose.connection.name);

    const defaultPasswordHash = await hashPassword('DemoPassword123!');

    // 1. Seed or Upsert Farmer Persona (Selvam R.)
    let farmer = await User.findOne({ email: 'farmer@vayalx.demo' });
    if (!farmer) {
      farmer = await User.create({
        name: 'Selvam R.',
        email: 'farmer@vayalx.demo',
        mobile: '9840123456',
        passwordHash: defaultPasswordHash,
        role: 'farmer',
        district: 'Thanjavur',
        state: 'Tamil Nadu',
        languagePreference: 'ta'
      });
      await FarmerProfile.create({
        user: farmer._id,
        farmName: 'Cauvery Green Bio-Farm',
        landAreaAcres: 4.5,
        primaryCrops: ['Paddy (Ponni)', 'Banana', 'Black Gram'],
        irrigationType: 'drip',
        soilType: 'Alluvial Clay Loam',
        district: 'Thanjavur'
      });
      console.log('  ✅ Created Demo Farmer: Selvam R. (farmer@vayalx.demo)');
    }

    // 2. Seed or Upsert Buyer Persona (Sundaram Agro Wholesale)
    let buyer = await User.findOne({ email: 'buyer@vayalx.demo' });
    if (!buyer) {
      buyer = await User.create({
        name: 'Sundaram Agro Wholesale',
        email: 'buyer@vayalx.demo',
        mobile: '9840987654',
        passwordHash: defaultPasswordHash,
        role: 'buyer',
        district: 'Chennai',
        state: 'Tamil Nadu',
        languagePreference: 'en'
      });
      await BuyerProfile.create({
        user: buyer._id,
        companyName: 'Sundaram Agro Wholesale Ltd',
        businessType: 'wholesaler',
        gstNumber: '33AAACS1234F1Z5',
        apmcLicenseNumber: 'APMC-TN-CHE-4402',
        preferredCrops: ['Paddy & Rice', 'Vegetables', 'Pulses']
      });
      console.log('  ✅ Created Demo Buyer: Sundaram Agro Wholesale (buyer@vayalx.demo)');
    }

    // 3. Seed or Upsert Supplier Persona (Kovai Agro Fleet Hub)
    let supplier = await User.findOne({ email: 'supplier@vayalx.demo' });
    if (!supplier) {
      supplier = await User.create({
        name: 'Kovai Agro Fleet Hub',
        email: 'supplier@vayalx.demo',
        mobile: '9840555666',
        passwordHash: defaultPasswordHash,
        role: 'supplier',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        languagePreference: 'en'
      });
      await SupplierProfile.create({
        user: supplier._id,
        businessName: 'Kovai Agro Fleet & Machinery Hub',
        supplierType: 'machinery_rental',
        gstNumber: '33AAAKF5678G2Z1',
        serviceDistricts: ['Coimbatore', 'Tiruppur', 'Erode', 'Thanjavur']
      });
      console.log('  ✅ Created Demo Supplier: Kovai Agro Fleet Hub (supplier@vayalx.demo)');
    }

    // 4. Seed Crop Listings for Farmer
    const existingListings = await CropListing.countDocuments({ farmer: farmer._id });
    if (existingListings === 0) {
      const listings = await CropListing.insertMany([
        {
          farmer: farmer._id,
          cropName: 'Paddy (Ponni Deluxe)',
          cropCategory: 'Paddy & Cereals',
          variety: 'BPT 5204 (Samba Mahsuri)',
          quantity: 2500,
          quantityUnit: 'Kg',
          price: 26,
          priceUnit: '₹/kg',
          location: 'Kumbakonam, Thanjavur',
          harvestDate: new Date('2026-03-15'),
          quality: 'Grade A (Export Quality)',
          description: 'Single-origin aged Ponni paddy harvested from fertile Cauvery delta fields. Low moisture content <12%.',
          status: 'active'
        },
        {
          farmer: farmer._id,
          cropName: 'Banana (Robusta G9)',
          cropCategory: 'Fruits',
          variety: 'Grand Naine Export Grade',
          quantity: 120,
          quantityUnit: 'Bunches',
          price: 360,
          priceUnit: '₹/Bunch',
          location: 'Papanasam, Thanjavur',
          harvestDate: new Date('2026-03-20'),
          quality: 'Grade A (Export Quality)',
          description: 'Export-grade Robusta bananas grown with drip fertigation and biological pest control.',
          status: 'active'
        },
        {
          farmer: farmer._id,
          cropName: 'Black Gram (VBN-8)',
          cropCategory: 'Pulses',
          variety: 'Vamban-8 High Protein',
          quantity: 800,
          quantityUnit: 'Kg',
          price: 92,
          priceUnit: '₹/kg',
          location: 'Orathanadu, Thanjavur',
          harvestDate: new Date('2026-03-10'),
          quality: 'Organic Certified',
          description: 'Certified organic black gram pulses, sun-dried and machine cleaned.',
          status: 'active'
        }
      ]);
      console.log(`  ✅ Seeded ${listings.length} Crop Listings for Farmer`);
    }

    // 5. Seed Equipment for Supplier
    const existingEquipment = await Equipment.countDocuments({ supplier: supplier._id });
    if (existingEquipment === 0) {
      const fleet = await Equipment.insertMany([
        {
          supplier: supplier._id,
          name: 'Mahindra 575 DI 45HP Tractor + Rotavator',
          category: 'Tractors',
          pricePerDay: 2400,
          pricePerHour: 350,
          location: 'Pollachi Road Hub',
          district: 'Coimbatore',
          description: 'Heavy duty 45HP tractor equipped with 42-blade rotavator. Fuel efficient, skilled operator included.',
          specifications: { hp: '45 HP', fuelType: 'Diesel', operatorIncluded: true, attachments: ['Rotavator', 'Cultivator', 'Tipping Trailer'] },
          status: 'available',
          availability: true
        },
        {
          supplier: supplier._id,
          name: 'Kubota DC-68G Multi-Crop Paddy Combine Harvester',
          category: 'Harvesters & Threshers',
          pricePerDay: 8500,
          pricePerHour: 1200,
          location: 'Udumalaipettai Center',
          district: 'Tiruppur',
          description: 'High-speed rubber crawler paddy combine harvester. 99% threshing recovery with negligible grain loss.',
          specifications: { hp: '68 HP', fuelType: 'Diesel', operatorIncluded: true, attachments: ['Paddy Cutting Bar', 'Grain Tank'] },
          status: 'available',
          availability: true
        },
        {
          supplier: supplier._id,
          name: 'AeroAgri 16L Precision Drone Sprayer',
          category: 'Drone Sprayers',
          pricePerDay: 3200,
          pricePerHour: 500,
          location: 'Saravanampatti Hub',
          district: 'Coimbatore',
          description: 'Automated GPS-guided 16-liter agri drone for spraying nano-urea and organic neem extracts in 15 mins/acre.',
          specifications: { hp: 'Electric LiPo', fuelType: 'Battery', operatorIncluded: true, attachments: ['Centrifugal Nozzles', 'Radar Terrain Follow'] },
          status: 'available',
          availability: true
        }
      ]);
      console.log(`  ✅ Seeded ${fleet.length} Machinery Equipment for Supplier`);
    }

    // 6. Seed Buyer Demands
    const existingDemands = await BuyerDemand.countDocuments({ buyer: buyer._id });
    if (existingDemands === 0) {
      const demands = await BuyerDemand.insertMany([
        {
          buyer: buyer._id,
          cropName: 'Country Tomato (Nattu Thakkali)',
          cropCategory: 'Vegetables',
          requiredQuantity: 1500,
          quantityUnit: 'Kg',
          targetPrice: 28,
          deliveryLocation: 'Koyambedu APMC Gate 4, Chennai',
          requiredBy: new Date('2026-04-05'),
          qualityRequirements: 'Firm ripe, medium size, farm-gate packed in standard 25kg crates',
          description: 'Procuring fresh country tomatoes for retail chain distribution across Chennai.',
          status: 'open'
        },
        {
          buyer: buyer._id,
          cropName: 'Turmeric Finger (Erode Variety)',
          cropCategory: 'Spices & Condiments',
          requiredQuantity: 3000,
          quantityUnit: 'Kg',
          targetPrice: 140,
          deliveryLocation: 'Erode Regulated Market Yard',
          requiredBy: new Date('2026-04-15'),
          qualityRequirements: 'High curcumin >3.5%, double boiled and polished finger turmeric',
          description: 'Bulk procurement for spice extraction and export packaging.',
          status: 'open'
        }
      ]);
      console.log(`  ✅ Seeded ${demands.length} Buyer Demands / Tenders`);
    }

    console.log('🎉 Phase 4 Marketplace Data Seed Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedMarketplace();
