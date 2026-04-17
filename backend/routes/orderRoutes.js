const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  acceptOrder,
  updateOrderStatus,
  updateDeliveryLocation,
  getTrackingDetails,
  completeDelivery,
  cancelOrder,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// ============= BUYER ROUTES =============
router.post('/create', protect, authorize('buyer'), createOrder);           // ✅ Create order
router.get('/stats/dashboard', protect, getOrderStats);                     // ✅ Get statistics
router.get('/my', protect, getMyOrders);                                    // ✅ Get all my orders
router.get('/:id', protect, getOrderById);                                  // ✅ Get single order
router.get('/:id/tracking', protect, getTrackingDetails);                   // ✅ Get real-time tracking
router.post('/:id/cancel', protect, cancelOrder);                           // ✅ Cancel order

// ============= FARMER ROUTES =============
router.post('/:id/accept', protect, authorize('farmer'), acceptOrder);      // ✅ Accept order
router.put('/:id/status', protect, authorize('farmer'), updateOrderStatus); // ✅ Update status
router.patch('/:id/location', protect, authorize('farmer'), updateDeliveryLocation); // ✅ Update location
router.post('/:id/complete', protect, authorize('farmer'), completeDelivery); // ✅ Complete delivery

module.exports = router;
