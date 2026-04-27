import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '@/config';

export default function ProductManagement() {
  const { user } = useAuth();
  const token = user?.token;

  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(
        `${API_URL}/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((prev: any) => prev.filter((p: any) => p._id !== id));
    } catch (err: any) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Delete failed: " + err.message);
    }
  };

  return (
    <div style={{
      padding: "30px",
      maxWidth: "1200px",
      margin: "auto"
    }}>
      <h1 style={{
        textAlign: "center",
        marginBottom: "30px",
        fontSize: "32px",
        fontWeight: "bold"
      }}>
        {user?.role === 'admin' ? "Product Management (Admin)" : "Product Management"}
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {products.map((p: any) => (
          <div
            key={p._id}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              transition: "0.3s"
            }}
          >
            <h3 style={{
              fontSize: "20px",
              marginBottom: "10px",
              color: "#2c3e50"
            }}>
              {p.cropName}
            </h3>

            <div style={{ fontSize: "14px" }}>
              <p><strong>Quantity:</strong> {p.quantity}</p>
              <p><strong>Price:</strong> ₹{p.price}</p>
              <p><strong>Location:</strong> {p.location}</p>
            </div>

            <button
              onClick={() => handleDelete(p._id)}
              style={{
                marginTop: "15px",
                width: "100%",
                padding: "10px",
                background: "#e74c3c",
                border: "none",
                color: "white",
                fontWeight: "bold",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#c0392b")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#e74c3c")}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}