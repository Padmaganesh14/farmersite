const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');


// ================= PUBLIC ROUTES =================

// Get all products
router.get('/', getProducts);

// Get single product by ID
router.get('/:id', getProductById);


// ================= FARMER ROUTES =================

// Create product
router.post(
  '/',
  protect,
  authorize('farmer'),
  upload.single('image'),
  addProduct
);

// Update product
router.put(
  '/:id',
  protect,
  authorize('farmer'),
  upload.single('image'),
  updateProduct
);

// Delete product
router.delete(
  '/:id',
  protect,
  authorize('farmer'),
  deleteProduct
);


module.exports = router;