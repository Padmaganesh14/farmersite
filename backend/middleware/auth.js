const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // ✅ Check if authorization header exists FIRST
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // ✅ If no token found, throw error immediately
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  // ✅ Try to verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    console.log(`✅ User authenticated: ${req.user.email}`);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401);
    throw new Error('Not authorized - Invalid token');
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize };
