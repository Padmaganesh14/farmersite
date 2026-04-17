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

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/add', protect, authorize('farmer'), upload.single('image'), addProduct);
router.put('/:id', protect, authorize('farmer'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('farmer'), deleteProduct);

module.exports = router;
