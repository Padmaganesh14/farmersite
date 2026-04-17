// src/pages/AddProductPage.tsx
// Complete working example - Copy and use!

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function AddProductPage() {
  const { user } = useAuth();
  const token = user?.token;  // ✅ Get token from user object
  
  // Form state
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    location: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and WEBP allowed.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum 5MB allowed.');
        return;
      }
      
      setImageFile(file);
      setError(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Validate all required fields
      if (!formData.cropName.trim()) {
        throw new Error('Crop name is required');
      }
      if (!formData.quantity.trim()) {
        throw new Error('Quantity is required');
      }
      if (!formData.price.trim()) {
        throw new Error('Price is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }

      // 2. Validate numbers
      const quantity = parseFloat(formData.quantity);
      const price = parseFloat(formData.price);

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }

      // 3. Check authentication
      if (!token) {
        throw new Error('You are not logged in. Please login first.');
      }

      // 4. Create FormData
      const data = new FormData();
      data.append('cropName', formData.cropName.trim());
      data.append('quantity', quantity.toString());
      data.append('price', price.toString());
      data.append('location', formData.location.trim());

      // 5. Add image if selected
      if (imageFile) {
        data.append('image', imageFile);
        console.log('📁 Image added:', imageFile.name);
      } else {
        console.log('📁 No image selected (optional)');
      }

      // 6. Make API request
      console.log('📤 Sending request to /api/products/add');
      const response = await axios.post(
        'http://localhost:5000/api/products/add',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type - let axios handle it with FormData
          },
        }
      );

      // 7. Success!
      console.log('✅ Product added successfully:', response.data);
      setSuccess('Product added successfully!');

      // Reset form
      setFormData({
        cropName: '',
        quantity: '',
        price: '',
        location: '',
      });
      setImageFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('❌ Error:', err);
      
      // Get error message
      let errorMessage = 'Failed to add product';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Please login first</h2>
        <p>You need to be logged in as a farmer to add products.</p>
      </div>
    );
  }

  // Check if user is farmer
  if (user.role !== 'farmer') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Farmer Access Only</h2>
        <p>Only farmers can add products.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Add New Product</h1>
      
      {/* Error Message */}
      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          border: '1px solid #fcc',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#efe',
          color: '#3c3',
          borderRadius: '4px',
          border: '1px solid #cfc',
        }}>
          ✅ {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Crop Name */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="cropName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Crop Name *
          </label>
          <input
            type="text"
            id="cropName"
            name="cropName"
            placeholder="e.g., Tomato, Potato, Rice"
            value={formData.cropName}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Quantity * (in kg/units)
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="e.g., 100"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Price */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Price per Unit * (₹)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            placeholder="e.g., 50.00"
            value={formData.price}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="e.g., Kerala, Tamil Nadu"
            value={formData.location}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="imageInput" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Product Image (Optional)
          </label>
          <input
            type="file"
            id="imageInput"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Allowed: JPEG, PNG, WEBP (Max 5MB) - Optional
          </p>
          {imageFile && (
            <p style={{ fontSize: '12px', color: '#3c3', marginTop: '5px' }}>
              ✅ Selected: {imageFile.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Adding Product...' : '✅ Add Product'}
        </button>
      </form>

      {/* Debug Info */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666',
      }}>
        <h3 style={{ marginTop: 0 }}>Debug Info</h3>
        <p>👤 User: {user.name}</p>
        <p>👨‍🌾 Role: {user.role}</p>
        <p>🔐 Token: {token ? '✅ Available' : '❌ Missing'}</p>
        <p>📁 Image selected: {imageFile ? `✅ ${imageFile.name}` : '❌ No'}</p>
      </div>
    </div>
  );
}
