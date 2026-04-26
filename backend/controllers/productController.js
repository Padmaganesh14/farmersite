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
// @access  Public (for testing) / Private (Farmer only)
const addProduct = asyncHandler(async (req, res) => {
  try {
    const { cropName, quantity, price, location } = req.body;

    // Use farmer from req.user if available (from protect middleware)
    // Otherwise allow creating without a farmer for simple testing
    const productData = {
      cropName,
      quantity,
      price,
      location,
      farmer: req.user ? req.user._id : req.body.farmer,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ message: error.message });
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

  // Ownership check removed as requested
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
