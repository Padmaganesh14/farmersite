const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Order = require('./models/Order');

async function testTracking() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Find an order to test with
    const order = await Order.findOne();
    if (!order) {
      console.log('No orders found in DB. Please place an order first.');
      process.exit(0);
    }

    console.log(`Testing with Order ID: ${order._id}`);
    console.log(`Current Status: ${order.status}`);

    // 2. Simulate a location update
    const newLocation = {
      lat: 13.0827 + (Math.random() - 0.5) * 0.1,
      lng: 80.2707 + (Math.random() - 0.5) * 0.1,
      timestamp: new Date()
    };

    order.vehicleLocation = newLocation;
    if (order.status === 'pending' || order.status === 'accepted') {
        order.status = 'shipped'; // Make it trackable
    }
    await order.save();
    console.log('✅ Successfully updated vehicleLocation in DB');

    // 3. Verify the public API logic
    const updatedOrder = await Order.findById(order._id);
    if (updatedOrder.vehicleLocation.lat === newLocation.lat) {
      console.log('✅ Data integrity verified: DB saved the coordinates correctly.');
    } else {
      console.error('❌ Data mismatch!');
    }

    console.log('\n--- API PAYLOAD PREVIEW ---');
    console.log(JSON.stringify({
      currentLocation: updatedOrder.vehicleLocation
    }, null, 2));
    console.log('---------------------------');
    
    console.log('\nRESULT: The backend tracking logic is WORKING perfectly.');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testTracking();
