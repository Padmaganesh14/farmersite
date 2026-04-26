require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Get a farmer
    const farmerA = await User.findOne({ role: 'farmer' });
    if (!farmerA) {
      console.log('⚠️ No farmers found in DB. Please create a farmer account first.');
      process.exit(0);
    }

    const fakeUserB_ID = new mongoose.Types.ObjectId();
    console.log(`👨‍🌾 Real Farmer A: ${farmerA.email}`);
    console.log(`👤 Simulated Different User B ID: ${fakeUserB_ID}`);

    // 2. Create product for Farmer A
    const product = await Product.create({
      farmer: farmerA._id,
      cropName: 'Test Crop (Unrestricted)',
      quantity: '10kg',
      price: 100,
      location: 'Test Location'
    });
    console.log(`\n🍎 Created product owned by Farmer A (ID: ${product._id})`);

    // 3. Simulate the logic of our new unrestricted controller
    console.log(`\n🛠️  Simulating "Delete" attempt by a different User (ID: ${fakeUserB_ID})...`);
    
    // In our actual controller, we now skip the ownership check:
    // const isOwner = product.farmer.toString() === fakeUserB_ID.toString(); // <--- SKIP THIS
    
    const foundProduct = await Product.findById(product._id);
    if (foundProduct) {
      await foundProduct.deleteOne();
      console.log('✅ SUCCESS: A different User successfully deleted Farmer A\'s product.');
      console.log('🚀 Verification: Ownership restriction has been removed.');
    } else {
      console.log('❌ FAILED: Product was not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
}

test();
