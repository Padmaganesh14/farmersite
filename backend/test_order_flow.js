require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function testFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find a farmer and a buyer
    const farmer = await User.findOne({ role: 'farmer' });
    const buyer = await User.findOne({ role: 'buyer' });

    if (!farmer || !buyer) {
      console.log('❌ Could not find a farmer and a buyer in DB.');
      process.exit(1);
    }
    console.log(`👨‍🌾 Farmer: ${farmer.email} | 🛒 Buyer: ${buyer.email}`);

    // 2. Ensure farmer has a product
    let product = await Product.findOne({ farmer: farmer._id });
    if (!product) {
      console.log('⚠️ Farmer has no products, creating a test product...');
      product = await Product.create({
        farmer: farmer._id,
        cropName: 'Test Tomatoes',
        price: 50,
        quantity: 100,
        category: 'vegetables',
        location: 'Test Farm'
      });
    }
    console.log(`🍎 Product: ${product.cropName} (ID: ${product._id})`);

    // 3. Simulate createOrder logic directly (what the controller does)
    console.log('\n--- 🛠️ CREATING ORDER ---');
    const order = await Order.create({
      buyer: buyer._id,
      product: product._id,
      farmer: product.farmer, // 🔥 This is the new field we added!
      quantity: 5,
      totalPrice: product.price * 5,
      buyerLocation: { lat: 13.0827, lng: 80.2707 },
      farmerLocation: { lat: 12.9716, lng: 77.5946 },
    });
    console.log(`✅ Order created successfully! ID: ${order._id}`);
    console.log(`📌 Order.farmer field value: ${order.farmer}`);

    // 4. Simulate farmer checking their dashboard (getMyOrders)
    console.log('\n--- 📊 FETCHING FARMER DASHBOARD ---');
    const farmerOrders = await Order.find({ farmer: farmer._id })
      .populate('buyer', 'name email')
      .populate('product', 'cropName price')
      .sort({ createdAt: -1 });

    const foundOrder = farmerOrders.find(o => o._id.toString() === order._id.toString());
    
    if (foundOrder) {
      console.log(`🎉 SUCCESS! The order appeared in the farmer's dashboard.`);
      console.log(`   Buyer: ${foundOrder.buyer.name}`);
      console.log(`   Product: ${foundOrder.product.cropName}`);
      console.log(`   Quantity: ${foundOrder.quantity}`);
    } else {
      console.log(`❌ FAILURE! The order did NOT appear in the farmer's dashboard.`);
    }

    // Cleanup: Remove the test order
    await Order.findByIdAndDelete(order._id);
    console.log('\n🧹 Cleaned up test order.');

    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
}

testFlow();
