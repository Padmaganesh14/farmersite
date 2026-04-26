const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Start truck delivery tracking
 * @route   POST /api/tracking/start/:orderId
 * @access  Private (Farmer only)
 */
const startDeliveryTracking = asyncHandler(async (req, res) => {
  try {
    console.log('=== START DELIVERY TRACKING ===');
    console.log('Order ID:', req.params.orderId);
    console.log('Truck data:', req.body);

    const { driverId, driverName, driverPhone, vehicleType, licensePlate } = req.body;

    // Validate required fields
    if (!driverName || !driverPhone || !vehicleType) {
      res.status(400);
      throw new Error('Missing required fields: driverName, driverPhone, vehicleType');
    }

    // Validate vehicle type
    const validVehicleTypes = ['motorcycle', 'bike', 'auto', 'truck', 'van'];
    if (!validVehicleTypes.includes(vehicleType)) {
      res.status(400);
      throw new Error(`Invalid vehicleType. Allowed: ${validVehicleTypes.join(', ')}`);
    }

    // Find order
    const order = await Order.findById(req.params.orderId).populate('product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization - user must be farmer who owns the product
    if (order.product.farmer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to track this order');
    }

    // Check order status
    if (!['accepted', 'shipped'].includes(order.status)) {
      res.status(400);
      throw new Error(`Cannot start tracking for order in ${order.status} status`);
    }

    // Initialize truck tracking
    order.truck = {
      licensePlate: licensePlate || '',
      driverId: driverId || req.user._id,
      driverName,
      driverPhone,
      vehicleType,
      isTracking: true,
    };

    order.trackingStartedAt = new Date();
    order.status = 'out_for_delivery';

    // Initialize location history with farmer location or default
    const initialLocation = order.farmerLocation?.lat ? order.farmerLocation : { lat: 13.0827, lng: 80.2707 };
    
    order.locationHistory = [
      {
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        timestamp: new Date(),
        speedKmh: 0,
      },
    ];
    order.vehicleLocation = initialLocation;

    const savedOrder = await order.save();

    // Populate for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('buyer', 'name email phone')
      .populate('product', 'cropName price');

    console.log('✅ Delivery tracking started for order:', order._id);
    res.status(200).json({
      message: 'Delivery tracking started',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('❌ ERROR in startDeliveryTracking:', error.message);
    throw error;
  }
});

/**
 * @desc    Update truck location (real-time)
 * @route   PATCH /api/tracking/:orderId/location
 * @access  Private (Farmer only)
 */
const updateTruckLocation = asyncHandler(async (req, res) => {
  try {
    console.log('=== UPDATE TRUCK LOCATION ===');
    console.log('Order ID:', req.params.orderId);
    console.log('Location:', req.body);

    const { lat, lng, speedKmh } = req.body;

    // Validate coordinates
    if (lat === undefined || lng === undefined) {
      res.status(400);
      throw new Error('Please provide lat and lng coordinates');
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400);
      throw new Error('Coordinates must be numbers');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400);
      throw new Error('Invalid coordinates - lat must be -90 to 90, lng must be -180 to 180');
    }

    // Find order
    const order = await Order.findById(req.params.orderId).populate('product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization
    if (order.product.farmer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }

    // Check if tracking is active
    if (!order.truck?.isTracking || !['shipped', 'out_for_delivery'].includes(order.status)) {
      res.status(400);
      throw new Error('Tracking is not active for this order');
    }

    const now = new Date();

    // Update current vehicle location
    const oldLocation = order.vehicleLocation || order.farmerLocation;
    order.vehicleLocation = { lat, lng, timestamp: now };

    // Calculate distance if possible
    if (oldLocation && order.locationHistory.length > 0) {
      const distance = calculateDistance(
        oldLocation.lat,
        oldLocation.lng,
        lat,
        lng
      );
      order.distanceTraveled = (order.distanceTraveled || 0) + distance;
    }

    // Add to location history
    order.locationHistory.push({
      lat,
      lng,
      timestamp: now,
      speedKmh: speedKmh || 0,
    });

    // Auto-transition to out_for_delivery if still in shipped status
    if (order.status === 'shipped') {
      order.status = 'out_for_delivery';
      order.trackingStartedAt = order.trackingStartedAt || now;
      console.log('📍 Auto-transitioned to out_for_delivery');
    }

    const savedOrder = await order.save();

    console.log('✅ Location updated for order:', order._id);
    res.status(200).json({
      message: 'Location updated',
      currentLocation: order.vehicleLocation,
      distanceTraveled: order.distanceTraveled,
      status: order.status,
    });
  } catch (error) {
    console.error('❌ ERROR in updateTruckLocation:', error.message);
    throw error;
  }
});

/**
 * @desc    Get live tracking data
 * @route   GET /api/tracking/:orderId/live
 * @access  Private
 */
const getLiveTracking = asyncHandler(async (req, res) => {
  try {
    console.log('=== GET LIVE TRACKING ===');
    console.log('Order ID:', req.params.orderId);

    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'name email phone')
      .populate('product', 'cropName price image farmer')
      .populate('truck.driverId', 'name email phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization - buyer or farmer
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isFarmer = order.product.farmer._id.toString() === req.user._id.toString();

    if (!isBuyer && !isFarmer) {
      res.status(403);
      throw new Error('Not authorized to view tracking');
    }

    // Calculate ETA
    let eta = null;
    if (order.estimatedArrival) {
      const timeRemaining = order.estimatedArrival.getTime() - new Date().getTime();
      if (timeRemaining > 0) {
        eta = Math.ceil(timeRemaining / (1000 * 60)); // minutes
      }
    }

    // Calculate progress percentage
    let progressPercent = 0;
    if (order.totalDistance && order.distanceTraveled) {
      progressPercent = Math.min(
        (order.distanceTraveled / order.totalDistance) * 100,
        95
      );
    }

    console.log('✅ Tracking data retrieved for order:', order._id);

    res.status(200).json({
      orderId: order._id,
      status: order.status,
      
      // Truck info
      truck: order.truck || null,
      
      // Locations
      farmerLocation: order.farmerLocation,
      buyerLocation: order.buyerLocation,
      vehicleLocation: order.vehicleLocation,
      currentLocation: order.vehicleLocation,
      
      // Routing
      totalDistance: order.totalDistance || null,
      distanceTraveled: order.distanceTraveled || 0,
      progressPercent: progressPercent,
      
      // Timing
      trackingStartedAt: order.trackingStartedAt,
      estimatedArrival: order.estimatedArrival,
      actualArrival: order.actualArrival,
      etaMinutes: eta,
      
      // Delivery info
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      productName: order.product?.cropName,
      buyerName: order.buyer?.name,
      buyerPhone: order.buyer?.phone,
      
      // Last update
      lastUpdated: order.vehicleLocation?.timestamp || order.trackingStartedAt,
      
      // History (limited to last 20 points for performance)
      locationHistory: order.locationHistory?.slice(-20) || [],
    });
  } catch (error) {
    console.error('❌ ERROR in getLiveTracking:', error.message);
    throw error;
  }
});

/**
 * @desc    End delivery/tracking
 * @route   POST /api/tracking/:orderId/complete
 * @access  Private (Farmer only)
 */
const completeDelivery = asyncHandler(async (req, res) => {
  try {
    console.log('=== COMPLETE DELIVERY ===');
    console.log('Order ID:', req.params.orderId);

    const { photoUrl, signature, notes } = req.body;

    // Find order
    const order = await Order.findById(req.params.orderId).populate('product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization
    if (order.product.farmer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    // Check if tracking is active
    if (!order.truck?.isTracking) {
      res.status(400);
      throw new Error('Tracking not active for this order');
    }

    const now = new Date();

    // Update order
    order.status = 'delivered';
    order.deliveredAt = now;
    order.actualArrival = now;
    order.truck.isTracking = false;
    order.trackingEndedAt = now;

    // Add delivery proof
    if (photoUrl || signature) {
      order.deliveryProof = {
        photoUrl: photoUrl || null,
        signature: signature || null,
        timestamp: now,
      };
    }

    if (notes) {
      order.notes = notes;
    }

    const savedOrder = await order.save();

    // Populate for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('buyer', 'name email')
      .populate('product', 'cropName');

    console.log('✅ Delivery completed for order:', order._id);

    res.status(200).json({
      message: 'Delivery completed successfully',
      order: populatedOrder,
      deliveryTime: {
        started: order.trackingStartedAt,
        ended: order.trackingEndedAt,
        durationMinutes: Math.round(
          (order.trackingEndedAt - order.trackingStartedAt) / (1000 * 60)
        ),
      },
      distanceTraveled: order.distanceTraveled,
    });
  } catch (error) {
    console.error('❌ ERROR in completeDelivery:', error.message);
    throw error;
  }
});

/**
 * @desc    Get all active deliveries for farmer
 * @route   GET /api/tracking/farmer/active
 * @access  Private (Farmer only)
 */
const getActiveDeliveries = asyncHandler(async (req, res) => {
  try {
    console.log('=== GET ACTIVE DELIVERIES ===');
    console.log('Farmer ID:', req.user._id);

    // Find all products owned by farmer
    const Product = require('../models/Product');
    const products = await Product.find({ farmer: req.user._id });
    const productIds = products.map(p => p._id);

    // Find all active orders for these products
    const orders = await Order.find({
      product: { $in: productIds },
      $or: [
        { status: 'shipped' },
        { status: 'out_for_delivery' },
      ],
      'truck.isTracking': true,
    })
      .populate('buyer', 'name phone email')
      .populate('product', 'cropName price')
      .sort({ trackingStartedAt: -1 });

    console.log(`✅ Found ${orders.length} active deliveries`);

    res.status(200).json({
      count: orders.length,
      orders: orders.map(order => ({
        orderId: order._id,
        status: order.status,
        buyerName: order.buyer.name,
        buyerPhone: order.buyer.phone,
        productName: order.product.cropName,
        quantity: order.quantity,
        truck: order.truck,
        currentLocation: order.vehicleLocation,
        totalDistance: order.totalDistance,
        distanceTraveled: order.distanceTraveled,
        trackingStartedAt: order.trackingStartedAt,
        estimatedArrival: order.estimatedArrival,
      })),
    });
  } catch (error) {
    console.error('❌ ERROR in getActiveDeliveries:', error.message);
    throw error;
  }
});

/**
 * @desc    Get tracking history
 * @route   GET /api/tracking/:orderId/history
 * @access  Private
 */
const getTrackingHistory = asyncHandler(async (req, res) => {
  try {
    console.log('=== GET TRACKING HISTORY ===');
    console.log('Order ID:', req.params.orderId);

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    console.log('✅ Tracking history retrieved');

    res.status(200).json({
      orderId: order._id,
      totalLocations: order.locationHistory?.length || 0,
      locationHistory: order.locationHistory || [],
      trackingStartedAt: order.trackingStartedAt,
      trackingEndedAt: order.trackingEndedAt,
      totalDistance: order.totalDistance,
      distanceTraveled: order.distanceTraveled,
    });
  } catch (error) {
    console.error('❌ ERROR in getTrackingHistory:', error.message);
    throw error;
  }
});

// ─── Helper Functions ───

/**
 * Calculate distance between two coordinates in km
 * Using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  startDeliveryTracking,
  updateTruckLocation,
  getLiveTracking,
  completeDelivery,
  getActiveDeliveries,
  getTrackingHistory,
};
