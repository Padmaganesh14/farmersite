const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { cropName, location } = req.query;
  let query = {};

  if (cropName) {
    query.cropName = { $regex: cropName, $options: 'i' };
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const products = await Product.find(query).populate('farmer', 'name email');
  res.status(200).json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('farmer', 'name email');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(product);
});

// @desc    Add new product
// @route   POST /api/products/add
// @access  Private (Farmer only)
const addProduct = asyncHandler(async (req, res) => {
  try {
    console.log('=== ADD PRODUCT DEBUG ===');
    console.log('User:', req.user ? `ID: ${req.user._id}` : 'NOT FOUND');
    console.log('Body:', req.body);
    console.log('File:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'NO FILE');

    // Validate user is authenticated
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('User not authenticated. Missing req.user');
    }

    const { cropName, quantity, price, location } = req.body;

    // Validate all required fields
    if (!cropName || !quantity || !price || !location) {
      res.status(400);
      const missingFields = [];
      if (!cropName) missingFields.push('cropName');
      if (!quantity) missingFields.push('quantity');
      if (!price) missingFields.push('price');
      if (!location) missingFields.push('location');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      res.status(400);
      throw new Error('Price must be a valid positive number');
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      res.status(400);
      throw new Error('Quantity must be a valid positive number');
    }

    // Get image path from file upload (optional)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    console.log('Image path:', imagePath || 'NONE (optional)');

    // Create product
    const product = await Product.create({
      farmer: req.user._id,
      cropName: cropName.trim(),
      quantity: quantityNum,
      price: priceNum,
      location: location.trim(),
      image: imagePath,
    });

    console.log('Product created:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('ERROR in addProduct:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer only)
const updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user ? req.user._id : 'NOT FOUND');
    console.log('Body:', req.body);
    console.log('File:', req.file ? `${req.file.filename}` : 'NO FILE');

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user is the farmer who owns the product
    if (product.farmer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this product');
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    console.log('Product updated:', updatedProduct._id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('ERROR in updateProduct:', error.message);
    throw error;
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer only)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user is the farmer who owns the product
  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await product.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
