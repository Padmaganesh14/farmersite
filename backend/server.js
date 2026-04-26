require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Placeholder
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));  // âœ… Truck tracking routes

// Default Route
app.get('/', (req, res) => {
  res.send('Farm Management API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Message:', err.message);
  console.error('Status Code:', res.statusCode);
  console.error('Stack:', err.stack);
  console.error('==================');

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
