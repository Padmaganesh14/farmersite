const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * Haversine Formula - Calculate distance between 2 coordinates
 * Returns distance in meters
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * @desc    Create new order
 * @route   POST /api/orders/create
 * @access  Private (Buyer only)
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const { productId, quantity, buyerLocation } = req.body;

  // ✅ Validation
  if (!productId || !quantity) {
    res.status(400);
    throw new Error('Please provide productId and quantity');
  }

  if (quantity < 1 || !Number.isInteger(quantity)) {
    res.status(400);
    throw new Error('Quantity must be a positive integer');
  }

  // ✅ Find product and farmer
  const product = await Product.findById(productId).populate('farmer', 'name email phone');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // ✅ Calculate total price
  const totalPrice = product.price * quantity;

  // ✅ Create order
  const order = await Order.create({
    buyer: req.user._id,
    product: productId,
     farmer: product.farmer._id,
    quantity,
    totalPrice,
    buyerLocation: buyerLocation || {
      lat: 0,
      lng: 0,
    },
    farmerLocation: product.location || {
      lat: 0,
      lng: 0,
    },
  });

  // ✅ Populate and return
  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email phone role')
    .populate('product', 'cropName price farmer')
    .populate('product.farmer', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder,
  });
});

/**
 * @desc    Get all orders (buyer sees own, farmer sees product orders)
 * @route   GET /api/orders/my
 * @access  Private
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  let orders;

  if (req.user.role === 'farmer') {
    // Farmer sees orders for their products
    orders = await Order.find({ farmer: req.user._id })
      .populate('buyer', 'name email phone')
      .populate('product', 'cropName price farmer image')
      .populate('product.farmer', 'name email phone')
      .sort({ createdAt: -1 });
  } else {
    // Buyer sees only their own orders
    orders = await Order.find({ buyer: req.user._id })
      .populate('buyer', 'name email phone')
      .populate('product', 'cropName price farmer image')
      .populate('product.farmer', 'name email phone')
      .sort({ createdAt: -1 });
  }

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email phone')
    .populate('product', 'cropName price farmer image location')
    .populate('product.farmer', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Authorization check - buyer or farmer
  if (
    req.user._id.toString() !== order.buyer._id.toString() &&
    req.user._id.toString() !== order.product.farmer._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Accept order (farmer only)
 * @route   POST /api/orders/:id/accept
 * @access  Private (Farmer only)
 */
exports.acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Check if user is the farmer
  if (order.product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the farmer can accept this order');
  }

  // ✅ Can only accept pending orders
  if (order.status !== 'pending') {
    res.status(400);
    throw new Error(`Cannot accept ${order.status} order`);
  }

  order.status = 'accepted';

  await order.save();

  const acceptedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email')
    .populate('product', 'cropName');

  res.json({
    success: true,
    message: 'Order accepted successfully',
    data: acceptedOrder,
  });
});

/**
 * @desc    Update order status (farmer only)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Farmer only)
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide status');
  }

  const order = await Order.findById(req.params.id).populate('product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Authorization check
  if (order.product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the farmer can update this order');
  }

  // ✅ Status progression validation
  const validStatuses = ['pending', 'accepted', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status: ${status}`);
  }

  // ✅ Define valid transitions
  const statusTransitions = {
    pending: ['accepted', 'cancelled'],
    accepted: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!statusTransitions[order.status].includes(status)) {
    res.status(400);
    throw new Error(
      `Cannot change status from ${order.status} to ${status}`
    );
  }

  // ✅ Update status
  order.status = status;

  // ✅ Set timestamps based on status
  if (status === 'shipped' && !order.trackingStartedAt) {
    order.trackingStartedAt = new Date();
    order.truck.isTracking = true;
  }

  if (status === 'out_for_delivery' && !order.actualArrival) {
    order.actualArrival = new Date();
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.trackingEndedAt = new Date();
    order.truck.isTracking = false;
  }

  if (status === 'cancelled') {
    order.trackingEndedAt = new Date();
    order.truck.isTracking = false;
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email')
    .populate('product', 'cropName');

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder,
  });
});

/**
 * @desc    Update vehicle location (farmer only)
 * @route   PATCH /api/orders/:id/location
 * @access  Private (Farmer only)
 */
exports.updateDeliveryLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  // ✅ Validation
  if (lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('Please provide latitude and longitude');
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    res.status(400);
    throw new Error('Latitude and longitude must be numbers');
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400);
    throw new Error('Invalid coordinates');
  }

  const order = await Order.findById(req.params.id).populate('product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Authorization check
  if (order.product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the farmer can update location');
  }

  // ✅ Can only update location for shipped/out_for_delivery orders
  if (!['shipped', 'out_for_delivery'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot update location for ${order.status} orders`);
  }

  // ✅ Calculate distance traveled
  let distanceTraveled = order.distanceTraveled || 0;

  if (order.vehicleLocation && order.vehicleLocation.lat && order.vehicleLocation.lng) {
    const distance = calculateDistance(
      order.vehicleLocation.lat,
      order.vehicleLocation.lng,
      lat,
      lng
    );
    distanceTraveled += distance / 1000; // Convert meters to km
  } else if (order.farmerLocation && order.farmerLocation.lat && order.farmerLocation.lng) {
    const distance = calculateDistance(
      order.farmerLocation.lat,
      order.farmerLocation.lng,
      lat,
      lng
    );
    distanceTraveled = distance / 1000; // Convert to km
  }

  // ✅ Calculate total distance if not already set
  if (!order.totalDistance && order.buyerLocation && order.buyerLocation.lat) {
    const totalDist = calculateDistance(
      order.farmerLocation.lat,
      order.farmerLocation.lng,
      order.buyerLocation.lat,
      order.buyerLocation.lng
    );
    order.totalDistance = totalDist / 1000;
  }

  // ✅ Add to location history (keep last 20)
  const newLocation = {
    lat,
    lng,
    timestamp: new Date(),
  };

  if (!order.locationHistory) {
    order.locationHistory = [];
  }

  order.locationHistory.push(newLocation);

  // Keep only last 20 locations
  if (order.locationHistory.length > 20) {
    order.locationHistory = order.locationHistory.slice(-20);
  }

  // ✅ Update current location
  order.vehicleLocation = {
    lat,
    lng,
    timestamp: new Date(),
  };

  order.distanceTraveled = Math.round(distanceTraveled * 100) / 100; // Round to 2 decimals

  // ✅ Calculate ETA (remaining distance / 40 km/h average speed)
  const remainingDistance = (order.totalDistance || 0) - order.distanceTraveled;
  const averageSpeed = 40; // km/h
  const estimatedTimeMinutes = Math.max(0, Math.ceil((remainingDistance / averageSpeed) * 60));
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + estimatedTimeMinutes);
  order.estimatedArrival = eta;

  // ✅ Auto-update status if reaching buyer
  if (remainingDistance <= 0.5 && order.status !== 'out_for_delivery') {
    order.status = 'out_for_delivery';
    order.actualArrival = new Date();
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id);

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      vehicleLocation: updatedOrder.vehicleLocation,
      distanceTraveled: updatedOrder.distanceTraveled,
      totalDistance: updatedOrder.totalDistance,
      estimatedArrival: updatedOrder.estimatedArrival,
      locationHistory: updatedOrder.locationHistory,
      status: updatedOrder.status,
    },
  });
});

/**
 * @desc    Get real-time tracking details
 * @route   GET /api/orders/:id/tracking
 * @access  Private
 */
exports.getTrackingDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('product', 'cropName')
    .populate('buyer', 'name phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Authorization check
  const isBuyer = req.user._id.toString() === order.buyer._id.toString();

  if (!isBuyer) {
    // Check if farmer
    const product = await Product.findById(order.product);
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view tracking');
    }
  }

  const trackingData = {
    _id: order._id,
    status: order.status,
    product: order.product,
    buyer: order.buyer,
    truck: order.truck,
    
    // Locations
    farmerLocation: order.farmerLocation,
    buyerLocation: order.buyerLocation,
    vehicleLocation: order.vehicleLocation,
    locationHistory: order.locationHistory || [],
    
    // Tracking info
    distanceTraveled: order.distanceTraveled,
    totalDistance: order.totalDistance,
    estimatedArrival: order.estimatedArrival,
    actualArrival: order.actualArrival,
    
    // Timestamps
    trackingStartedAt: order.trackingStartedAt,
    trackingEndedAt: order.trackingEndedAt,
    expectedDelivery: order.expectedDelivery,
    deliveredAt: order.deliveredAt,
    
    // Progress
    progress: order.totalDistance
      ? Math.round((order.distanceTraveled / order.totalDistance) * 100)
      : 0,
  };

  res.json({
    success: true,
    data: trackingData,
  });
});

/**
 * @desc    Complete delivery (mark as delivered)
 * @route   POST /api/orders/:id/complete
 * @access  Private (Farmer only)
 */
exports.completeDelivery = asyncHandler(async (req, res) => {
  const { photoUrl, signature } = req.body;

  const order = await Order.findById(req.params.id).populate('product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Check if farmer
  if (order.product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the farmer can complete delivery');
  }

  // ✅ Can only complete out_for_delivery orders
  if (order.status !== 'out_for_delivery') {
    res.status(400);
    throw new Error(
      `Cannot complete ${order.status} order. Must be out_for_delivery.`
    );
  }

  order.status = 'delivered';
  order.deliveredAt = new Date();
  order.trackingEndedAt = new Date();
  order.truck.isTracking = false;

  // ✅ Save delivery proof if provided
  if (photoUrl || signature) {
    order.deliveryProof = {
      photoUrl: photoUrl || null,
      signature: signature || null,
      timestamp: new Date(),
    };
  }

  await order.save();

  const completedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email')
    .populate('product', 'cropName');

  res.json({
    success: true,
    message: 'Delivery completed successfully',
    data: completedOrder,
  });
});

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:id/cancel
 * @access  Private (Farmer or Buyer - depending on status)
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id).populate('product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ Authorization check
  const isFarmer = order.product.farmer.toString() === req.user._id.toString();
  const isBuyer = order.buyer.toString() === req.user._id.toString();

  if (!isFarmer && !isBuyer) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // ✅ Validation: can only cancel if pending/accepted
  if (!['pending', 'accepted'].includes(order.status)) {
    res.status(400);
    throw new Error(
      `Cannot cancel ${order.status} order. Only pending and accepted orders can be cancelled.`
    );
  }

  // ✅ Buyer can only cancel pending, farmer can cancel pending/accepted
  if (isBuyer && order.status !== 'pending') {
    res.status(400);
    throw new Error('Buyer can only cancel pending orders');
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'No reason provided';
  order.trackingEndedAt = new Date();
  order.truck.isTracking = false;

  await order.save();

  const cancelledOrder = await Order.findById(order._id)
    .populate('buyer', 'name email')
    .populate('product', 'cropName');

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: cancelledOrder,
  });
});

/**
 * @desc    Get order statistics (for dashboard)
 * @route   GET /api/orders/stats/dashboard
 * @access  Private
 */
exports.getOrderStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  let query = {};

  if (role === 'farmer') {
    query = { farmer: userId };
  } else {
    query = { buyer: userId };
  }

  const stats = {
    total: await Order.countDocuments(query),
    pending: await Order.countDocuments({ ...query, status: 'pending' }),
    accepted: await Order.countDocuments({ ...query, status: 'accepted' }),
    shipped: await Order.countDocuments({ ...query, status: 'shipped' }),
    outForDelivery: await Order.countDocuments({ ...query, status: 'out_for_delivery' }),
    delivered: await Order.countDocuments({ ...query, status: 'delivered' }),
    cancelled: await Order.countDocuments({ ...query, status: 'cancelled' }),
  };

  const totalRevenue = await Order.aggregate([
    { $match: { ...query, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  stats.totalRevenue = totalRevenue[0]?.total || 0;

  res.json({
    success: true,
    data: stats,
  });
});