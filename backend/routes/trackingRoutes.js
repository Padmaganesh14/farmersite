const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  startDeliveryTracking,
  updateTruckLocation,
  getLiveTracking,
  completeDelivery,
  getActiveDeliveries,
  getTrackingHistory,
} = require('../controllers/truckTrackingController');


// ================= BUYER + FARMER =================

// 🚚 Get live tracking (USED BY MAP)
router.get('/:orderId/live', protect, getLiveTracking);

// 📜 Get tracking history
router.get('/:orderId/history', protect, getTrackingHistory);


// ================= FARMER ONLY =================

// 🚀 Start delivery tracking
router.post(
  '/start/:orderId',
  protect,
  authorize('farmer'),
  startDeliveryTracking
);

// 📍 Update truck location
router.patch(
  '/:orderId/location',
  protect,
  authorize('farmer'),
  updateTruckLocation
);

// ✅ Complete delivery
router.post(
  '/:orderId/complete',
  protect,
  authorize('farmer'),
  completeDelivery
);

// 📊 Farmer active deliveries
router.get(
  '/farmer/active',
  protect,
  authorize('farmer'),
  getActiveDeliveries
);

module.exports = router;