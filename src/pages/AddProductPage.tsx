import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '@/config';

export default function AddProductPage() {
  const { user } = useAuth();
  const token = user?.token;
  
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    location: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and WEBP allowed.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum 5MB allowed.');
        return;
      }
      
      setImageFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.cropName.trim()) throw new Error('Crop name is required');
      if (!formData.quantity.trim()) throw new Error('Quantity is required');
      if (!formData.price.trim()) throw new Error('Price is required');
      if (!formData.location.trim()) throw new Error('Location is required');

      const quantity = parseFloat(formData.quantity);
      const price = parseFloat(formData.price);

      if (isNaN(quantity) || quantity <= 0) throw new Error('Quantity must be a positive number');
      if (isNaN(price) || price <= 0) throw new Error('Price must be a positive number');

      if (!token) throw new Error('You are not logged in. Please login first.');

      const data = new FormData();
      data.append('cropName', formData.cropName.trim());
      data.append('quantity', quantity.toString());
      data.append('price', price.toString());
      data.append('location', formData.location.trim());

      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await axios.post(
        `${API_URL}/api/products/add`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSuccess('Product added successfully!');
      setFormData({
        cropName: '',
        quantity: '',
        price: '',
        location: '',
      });
      setImageFile(null);
      
      const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('❌ Error:', err);
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

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Please login first</h2>
        <p>You need to be logged in as a farmer to add products.</p>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit}>
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
