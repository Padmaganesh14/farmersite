const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    // Reference to buyer (user who placed the order)
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please add buyer ID'],
      ref: 'User',
    },

    // Reference to product being ordered
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please add product ID'],
      ref: 'Product',
    },

    // Quantity ordered
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      min: [1, 'Quantity must be at least 1'],
    },

    // Total price of the order
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },

    // Order status progression
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'accepted', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },

    // Farmer's location
    farmerLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Buyer's delivery location
    buyerLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Vehicle's current location (updated during delivery)
    vehicleLocation: {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date },
    },

    // Location history for route tracking
    locationHistory: [
      {
        lat: { type: Number },
        lng: { type: Number },
        timestamp: { type: Date },
        speedKmh: { type: Number },
      },
    ],

    // Truck/Vehicle details
    truck: {
      licensePlate: { type: String },
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      driverName: { type: String },
      driverPhone: { type: String },
      vehicleType: { type: String, enum: ['motorcycle', 'bike', 'auto', 'truck', 'van'] },
      isTracking: { type: Boolean, default: false },
    },

    // Delivery tracking
    trackingStartedAt: { type: Date },
    trackingEndedAt: { type: Date },
    estimatedArrival: { type: Date },
    actualArrival: { type: Date },
    distanceTraveled: { type: Number, default: 0 }, // in km
    totalDistance: { type: Number }, // in km from farm to buyer

    // Expected delivery date
    expectedDelivery: {
      type: Date,
    },

    // Actual delivery date
    deliveredAt: {
      type: Date,
    },

    // Cancellation reason (if cancelled)
    cancellationReason: {
      type: String,
    },

    // Notes from farmer or buyer
    notes: {
      type: String,
    },

    // Delivery proof
    deliveryProof: {
      photoUrl: { type: String },
      signature: { type: String },
      timestamp: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ product: 1, status: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
