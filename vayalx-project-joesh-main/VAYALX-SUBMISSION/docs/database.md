# VAYALX Database Architecture

VAYALX uses MongoDB with strict Mongoose schemas to ensure data integrity and relational mapping without SQL joins.

## Core Models

### User Model
- **Purpose**: Handles authentication and core identity.
- **Fields**: `name`, `email` (unique), `passwordHash`, `role` (enum: farmer, buyer, supplier, admin), `isActive`.

### Role-Specific Profiles
- **FarmerProfile**: Contains `district`, `landAreaAcre`, `primaryCrops`.
- **BuyerProfile**: Contains `businessName`, `businessType` (retail, wholesale, exporter), `gstNumber`.
- **SupplierProfile**: Contains `fleetSize`, `serviceArea`.

### Marketplace Models
- **CropListing**: Owned by a `Farmer`. Contains `cropName`, `quantity`, `price`, `status` (active, sold).
- **PurchaseOrder**: Links a `Buyer`, `Farmer`, and `CropListing`. Tracks `quantity`, `unitPrice`, `totalAmount`, `status` (pending, accepted, rejected).
- **Equipment**: Owned by a `Supplier`. Details machinery available for rent (`pricePerDay`, `location`).
- **EquipmentBooking**: Links a `Farmer`, `Supplier`, and `Equipment`. Tracks `startDate`, `endDate`, `totalAmount`, `status`.

### Tracking Models
- **Prebooking**: Advance harvest contracts linking `Farmer` to future yields.
- **FarmRecord**: Financial ledger (expenses, revenues) tracking profitability per season.
- **Notification**: System-generated alerts (e.g., "Order Accepted") linking to a specific `recipient`.

## Key Architectural Decisions
- **ObjectId Referencing**: Relationships are maintained using `mongoose.Schema.Types.ObjectId` with `ref` tags. 
- **Denormalization vs Reference**: The system uses reference IDs and `populate()` to fetch relational data, maintaining a single source of truth for financial figures (e.g. `PurchaseOrder` calculates its `totalAmount` by looking up the referenced `CropListing` price at creation).
- **Timestamps**: All models use Mongoose `timestamps: true` to auto-manage `createdAt` and `updatedAt`.
