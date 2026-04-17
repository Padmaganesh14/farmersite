const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Debug: Check if MONGO_URI is loaded
        console.log('--- Database Connection Debug ---');
        console.log('Checking MONGO_URI...');
        
        if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string') {
            console.error('ERROR: MONGO_URI is not defined or is still the placeholder.');
            console.error('Please check your .env file and ensure MONGO_URI has a valid connection string.');
            process.exit(1);
        }

        console.log('MONGO_URI found. Attempting connection...');
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log('---------------------------------');
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        console.error('Check if your MongoDB Atlas cluster is active or local MongoDB is running.');
        process.exit(1);
    }
};

module.exports = connectDB;
