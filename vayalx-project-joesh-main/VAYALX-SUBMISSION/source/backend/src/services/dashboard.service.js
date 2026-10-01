// VAYALX Role Dashboard Summary Service (Phase 4 Real KPI Statistics)
const {
  CropListing,
  PurchaseOrder,
  BuyerDemand,
  Equipment,
  EquipmentBooking,
  FarmRecord,
  Notification
} = require('../models');

class DashboardService {
  /**
   * Farmer Dashboard Real MongoDB KPIs
   */
  async getFarmerDashboardSummary(farmerId) {
    const [
      activeListingsCount,
      pendingOrdersCount,
      acceptedOrders,
      farmRecords,
      unreadNotifsCount
    ] = await Promise.all([
      CropListing.countDocuments({ farmer: farmerId, status: 'active' }),
      PurchaseOrder.countDocuments({ farmer: farmerId, status: 'pending' }),
      PurchaseOrder.find({ farmer: farmerId, status: { $in: ['accepted', 'delivered', 'dispatched'] } }).select('totalAmount').lean(),
      FarmRecord.find({ farmer: farmerId }).select('cost revenue').lean(),
      Notification.countDocuments({ recipient: farmerId, isRead: false })
    ]);

    const orderRevenue = acceptedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const farmExpense = farmRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    const recordedRevenue = farmRecords.reduce((sum, r) => sum + (r.revenue || 0), 0);

    return {
      role: 'farmer',
      activeListingsCount,
      pendingOrdersCount,
      totalSeasonRevenue: orderRevenue + recordedRevenue,
      totalFarmExpenses: farmExpense,
      unreadNotificationsCount: unreadNotifsCount
    };
  }

  /**
   * Buyer Dashboard Real MongoDB KPIs
   */
  async getBuyerDashboardSummary(buyerId) {
    const [
      activeOrdersCount,
      pendingOrdersCount,
      openDemandsCount,
      allOrders,
      unreadNotifsCount
    ] = await Promise.all([
      PurchaseOrder.countDocuments({ buyer: buyerId, status: { $in: ['accepted', 'confirmed', 'dispatched'] } }),
      PurchaseOrder.countDocuments({ buyer: buyerId, status: 'pending' }),
      BuyerDemand.countDocuments({ buyer: buyerId, status: 'open' }),
      PurchaseOrder.find({ buyer: buyerId, status: { $ne: 'cancelled' } }).select('totalAmount').lean(),
      Notification.countDocuments({ recipient: buyerId, isRead: false })
    ]);

    const totalProcurementSpend = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      role: 'buyer',
      activeOrdersCount,
      pendingOrdersCount,
      openDemandsCount,
      totalProcurementSpend,
      unreadNotificationsCount: unreadNotifsCount
    };
  }

  /**
   * Supplier Dashboard Real MongoDB KPIs
   */
  async getSupplierDashboardSummary(supplierId) {
    const [
      equipmentCount,
      pendingBookingsCount,
      activeBookings,
      unreadNotifsCount
    ] = await Promise.all([
      Equipment.countDocuments({ supplier: supplierId, status: { $ne: 'inactive' } }),
      EquipmentBooking.countDocuments({ supplier: supplierId, status: 'pending' }),
      EquipmentBooking.find({ supplier: supplierId, status: { $in: ['accepted', 'active', 'completed'] } }).select('totalAmount').lean(),
      Notification.countDocuments({ recipient: supplierId, isRead: false })
    ]);

    const rentalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      role: 'supplier',
      equipmentCount,
      pendingBookingsCount,
      activeBookingsCount: activeBookings.length,
      totalRentalRevenue: rentalRevenue,
      unreadNotificationsCount: unreadNotifsCount
    };
  }
}

module.exports = new DashboardService();
