# POST /api/products/add - Complete Setup Guide

## ✅ What Was Fixed

1. **Enhanced error logging** - Console logs now show detailed debugging info
2. **User validation** - Checks if `req.user` exists before using it
3. **Data type validation** - Converts and validates price/quantity as numbers
4. **Multer logging** - File upload process is now traceable
5. **Better error messages** - Shows exactly which field is missing
6. **Proper error handling** - All errors are caught and logged

---

## 📋 Files Setup

### 1. Backend Middleware - `backend/middleware/uploadMiddleware.js` ✅ DONE
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[MULTER] Destination: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    console.log(`[MULTER] Filename: ${filename}`);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(`[MULTER] Received file: ${file.originalname}, mimetype: ${file.mimetype}`);
  
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    console.log('[MULTER] File accepted');
    return cb(null, true);
  } else {
    console.error(`[MULTER] File rejected: ${file.originalname}`);
    cb(new Error('Error: Only images (jpeg, jpg, png, webp) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
```

### 2. Backend Routes - `backend/routes/productRoutes.js` ✅ ALREADY CORRECT
```javascript
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

// Key line: upload.single('image') MUST match FormData field name
router.post('/add', protect, authorize('farmer'), upload.single('image'), addProduct);

module.exports = router;
```

### 3. Backend Controller - `backend/controllers/productController.js` ✅ FIXED
```javascript
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
```

### 4. Backend Model - `backend/models/Product.js` ✅ ALREADY CORRECT
```javascript
const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
    },
    quantity: {
      type: Number,  // ← Should be Number for calculations
      required: [true, 'Please add quantity'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
```

---

## 📱 Frontend - React FormData Request

### Example 1: Basic Product Upload (Beginner-Friendly)
```javascript
// src/pages/AddProduct.tsx or similar
import axios from 'axios';

const handleAddProduct = async (e) => {
  e.preventDefault();
  
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add text fields
    formData.append('cropName', 'Tomato');
    formData.append('quantity', '100');  // ← String from form input
    formData.append('price', '50.00');   // ← String from form input
    formData.append('location', 'Kerala');
    
    // Add image file (if user selected one)
    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]); // ← MUST match multer.single('image')
    }

    // Send request with JWT token
    const token = localStorage.getItem('token'); // or from context
    const response = await axios.post(
      'http://localhost:5000/api/products/add',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // ← IMPORTANT
        },
      }
    );

    console.log('Product added:', response.data);
    // Redirect or show success message
  } catch (error) {
    console.error('Error adding product:', error.response?.data || error.message);
    // Show error to user
  }
};

// HTML Form
<form onSubmit={handleAddProduct}>
  <input 
    type="text" 
    placeholder="Crop Name"
    value={cropName}
    onChange={(e) => setCropName(e.target.value)}
  />
  <input 
    type="number" 
    placeholder="Quantity"
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
  />
  <input 
    type="number" 
    placeholder="Price"
    step="0.01"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
  />
  <input 
    type="text" 
    placeholder="Location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
  />
  <input 
    id="imageInput"
    type="file" 
    accept="image/jpeg,image/jpg,image/png,image/webp"
  />
  <button type="submit">Add Product</button>
</form>
```

### Example 2: Using React State (Better Practice)
```javascript
import axios from 'axios';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function AddProductForm() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    location: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate all fields
      if (!formData.cropName || !formData.quantity || !formData.price || !formData.location) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Create FormData
      const data = new FormData();
      data.append('cropName', formData.cropName);
      data.append('quantity', formData.quantity);
      data.append('price', formData.price);
      data.append('location', formData.location);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      // Send request
      const response = await axios.post(
        'http://localhost:5000/api/products/add',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Product added successfully:', response.data);
      
      // Reset form
      setFormData({
        cropName: '',
        quantity: '',
        price: '',
        location: '',
        image: null,
      });
      
      // Show success (implement your toast/notification)
      alert('Product added successfully!');
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        name="cropName"
        placeholder="Crop Name (e.g., Tomato)"
        value={formData.cropName}
        onChange={handleChange}
        required
      />
      
      <input
        type="number"
        name="quantity"
        placeholder="Quantity (e.g., 100)"
        value={formData.quantity}
        onChange={handleChange}
        required
      />
      
      <input
        type="number"
        name="price"
        step="0.01"
        placeholder="Price per unit (e.g., 50.00)"
        value={formData.price}
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="location"
        placeholder="Location (e.g., Kerala)"
        value={formData.location}
        onChange={handleChange}
        required
      />
      
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
}
```

---

## 🚨 Common Mistakes Checklist

### ❌ MISTAKE 1: Using JSON instead of FormData
```javascript
// ❌ WRONG - This will NOT work with file upload
axios.post('/api/products/add', {
  cropName: 'Tomato',
  price: 50,
  image: file, // ❌ File objects can't be sent as JSON
});

// ✅ CORRECT
const data = new FormData();
data.append('cropName', 'Tomato');
data.append('price', 50);
data.append('image', file);
axios.post('/api/products/add', data);
```

### ❌ MISTAKE 2: Wrong FormData field name
```javascript
// ❌ WRONG - Route expects 'image' but you send 'file'
formData.append('file', imageFile); // ❌
// Route: upload.single('image') ← Looking for 'image' field

// ✅ CORRECT
formData.append('image', imageFile); // ✅
```

### ❌ MISTAKE 3: Missing Authorization header
```javascript
// ❌ WRONG - No token, returns 401
axios.post('/api/products/add', formData);

// ✅ CORRECT
axios.post('/api/products/add', formData, {
  headers: {
    'Authorization': `Bearer ${token}`, // ✅
  }
});
```

### ❌ MISTAKE 4: Sending numbers as strings without parsing
```javascript
// ❌ PROBLEMATIC - Backend receives string "50" instead of number 50
formData.append('price', userInput); // From <input type="text" />

// ✅ BETTER - Convert in backend (already handled) OR in frontend
formData.append('price', parseFloat(userInput));
```

### ❌ MISTAKE 5: Forgetting Content-Type header
```javascript
// ❌ WRONG - axios will override with wrong header
axios.post('/api/products/add', formData, {
  headers: {
    'Content-Type': 'application/json', // ❌ Wrong!
  }
});

// ✅ CORRECT - Let axios handle it OR be explicit
axios.post('/api/products/add', formData);
// OR explicitly set multipart
axios.post('/api/products/add', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});
```

### ❌ MISTAKE 6: Assuming file is always uploaded
```javascript
// ❌ WRONG - Crashes if no file uploaded
const imagePath = `/uploads/${req.file.filename}`; // ❌ req.file could be undefined

// ✅ CORRECT
const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
```

### ❌ MISTAKE 7: No error handling for multer errors
```javascript
// ❌ WRONG - Route doesn't catch multer errors
router.post('/add', upload.single('image'), addProduct);

// ✅ BETTER - Multer errors are caught by global error handler
// But it's good practice to validate in controller anyway
```

---

## 🧪 Testing the Endpoint

### Using cURL (Command Line)
```bash
# 1. Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123"
  }'

# Response includes token: "eyJhbGciOiJIUzI1NiIs..."

# 2. Add product with file
curl -X POST http://localhost:5000/api/products/add \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "cropName=Tomato" \
  -F "quantity=100" \
  -F "price=50" \
  -F "location=Kerala" \
  -F "image=@/path/to/image.jpg"
```

### Using Postman
1. **Create new POST request** to `http://localhost:5000/api/products/add`
2. **Headers tab**: Add `Authorization: Bearer YOUR_TOKEN`
3. **Body tab**: Select "form-data"
4. **Fields**:
   - `cropName` (text): "Tomato"
   - `quantity` (text): "100"
   - `price` (text): "50"
   - `location` (text): "Kerala"
   - `image` (file): Select image file
5. **Send**

---

## 📊 Expected Responses

### ✅ Success (201 Created)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "farmer": "507f1f77bcf86cd799439010",
  "cropName": "Tomato",
  "quantity": 100,
  "price": 50,
  "location": "Kerala",
  "image": "/uploads/1634567890123-tomato.jpg",
  "createdAt": "2024-04-16T10:30:00Z",
  "updatedAt": "2024-04-16T10:30:00Z"
}
```

### ❌ Error Examples

**Missing token (401)**
```json
{
  "message": "Not authorized, no token",
  "stack": "..."
}
```

**Missing required field (400)**
```json
{
  "message": "Missing required fields: cropName, price",
  "stack": "..."
}
```

**Invalid price (400)**
```json
{
  "message": "Price must be a valid positive number",
  "stack": "..."
}
```

**Invalid file type (400)**
```json
{
  "message": "Error: Only images (jpeg, jpg, png, webp) are allowed!",
  "stack": "..."
}
```

---

## 🔍 Debugging Steps

### Step 1: Check Backend Console
```bash
cd backend
npm run dev
# Watch console logs for:
# [MULTER] Received file: ...
# === ADD PRODUCT DEBUG ===
# User: ID: ...
# Body: { cropName: ..., quantity: ..., ... }
# File: ... or NO FILE
```

### Step 2: Check Browser Console
```javascript
// In browser DevTools Console
// Look for error messages and network responses

// Also check request details in Network tab:
// 1. Click the request
// 2. Headers: Check Authorization and Content-Type
// 3. Payload: See what was sent
// 4. Response: See error message
```

### Step 3: Check Token Validity
```javascript
// Decode JWT to verify it's not expired
// https://jwt.io

// Or in browser console:
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### Step 4: Check Uploads Folder
```bash
# Windows PowerShell
Get-ChildItem backend/uploads

# Linux/Mac
ls -la backend/uploads/

# Should see files like: 1634567890123-image.jpg
```

---

## 📦 Dependencies Required

```json
{
  "dependencies": {
    "express": "^4.22.1",
    "express-async-handler": "^1.2.0",
    "multer": "^2.1.1",
    "mongoose": "^8.23.0",
    "jsonwebtoken": "^9.0.3"
  }
}
```

All are already in your `backend/package.json` ✅

---

## 🚀 Quick Start Summary

1. ✅ **Backend middleware** - Multer configured to handle file uploads
2. ✅ **Backend routes** - POST /api/products/add with `upload.single('image')`
3. ✅ **Backend controller** - Proper validation, error handling, and logging
4. ✅ **Frontend** - Use FormData with correct field names
5. ✅ **Error handling** - All errors logged to console for debugging

**Start server:**
```bash
cd backend
npm install  # If needed
npm run dev
```

**Test the endpoint:**
- Use provided FormData example from React
- Check console logs for debugging
- Verify files appear in `backend/uploads/` folder

---

## 📞 If Still Getting 500 Error

1. **Check backend console** - Look for error message in console logs
2. **Verify JWT token** - Is `req.user` populated?
3. **Check file upload** - Look for `[MULTER]` logs
4. **Verify field names** - Make sure FormData matches route requirements
5. **Check database** - Is MongoDB connected?

Share the **console error message** for specific help!
