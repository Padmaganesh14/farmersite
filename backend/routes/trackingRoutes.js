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

// ─── Public/Private Routes ───

/**
 * @route   GET /api/tracking/:orderId/live
 * @desc    Get live tracking data for an order
 * @access  Private (Buyer or Farmer who owns the order)
 */
router.get('/:orderId/live', protect, getLiveTracking);

/**
 * @route   GET /api/tracking/:orderId/history
 * @desc    Get tracking location history
 * @access  Private
 */
router.get('/:orderId/history', protect, getTrackingHistory);

// ─── Farmer Only Routes ───

/**
 * @route   POST /api/tracking/start/:orderId
 * @desc    Start truck delivery tracking
 * @access  Private (Farmer only)
 */
router.post('/start/:orderId', protect, authorize('farmer'), startDeliveryTracking);

/**
 * @route   PATCH /api/tracking/:orderId/location
 * @desc    Update truck location in real-time
 * @access  Private (Farmer only)
 */
router.patch('/:orderId/location', protect, authorize('farmer'), updateTruckLocation);

/**
 * @route   POST /api/tracking/:orderId/complete
 * @desc    Complete delivery and end tracking
 * @access  Private (Farmer only)
 */
router.post('/:orderId/complete', protect, authorize('farmer'), completeDelivery);

/**
 * @route   GET /api/tracking/farmer/active
 * @desc    Get all active deliveries for a farmer
 * @access  Private (Farmer only)
 */
router.get('/farmer/active', protect, authorize('farmer'), getActiveDeliveries);

module.exports = router;
