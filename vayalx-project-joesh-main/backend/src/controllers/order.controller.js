// VAYALX Purchase Order Controller (Phase 4)
const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/error.middleware');

class OrderController {
  createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Purchase order placed successfully. Notification dispatched to farmer.',
      data: order
    });
  });

  getMyOrders = asyncHandler(async (req, res) => {
    // If buyer, fetch buyer orders; if farmer, fetch farmer orders
    if (req.user.role === 'buyer') {
      const result = await orderService.getBuyerOrders(req.user._id, req.query);
      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } else if (req.user.role === 'farmer') {
      const result = await orderService.getFarmerOrders(req.user._id, req.query);
      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } else {
      // Admin / Multi-role
      const result = await orderService.getBuyerOrders(req.user._id, req.query);
      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    }
  });

  getReceivedOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getFarmerOrders(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  });

  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: order
    });
  });

  acceptOrder = asyncHandler(async (req, res) => {
    const order = await orderService.acceptOrder(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Order accepted successfully. Buyer notified.',
      data: order
    });
  });

  rejectOrder = asyncHandler(async (req, res) => {
    const order = await orderService.rejectOrder(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Order declined. Buyer notified.',
      data: order
    });
  });

  cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: order
    });
  });
}

module.exports = new OrderController();
