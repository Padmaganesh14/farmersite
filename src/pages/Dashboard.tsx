 
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ Always initialize as array
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    cropName: '',
    price: '',
    quantity: '',
    location: '',
    category: 'vegetables',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!user) return <Navigate to="/login" />;

  const isFarmer = user.role === 'farmer';

  // ✅ FETCH DATA (FIXED)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // FETCH ORDERS
        const orderRes = await fetch('http://localhost:5000/api/orders/my', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (orderRes.ok) {
          const data = await orderRes.json();
          console.log("ORDERS API:", data);

          // ✅ HANDLE ANY RESPONSE SHAPE
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }

        // FETCH PRODUCTS (ONLY FARMER)
        if (isFarmer) {
          const prodRes = await fetch('http://localhost:5000/api/products');
          if (prodRes.ok) {
            const data = await prodRes.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user]);

  // ✅ ADD PRODUCT
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('cropName', newProduct.cropName);
      formData.append('price', newProduct.price);
      formData.append('quantity', newProduct.quantity);
      formData.append('location', newProduct.location);
      formData.append('category', newProduct.category);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const added = await res.json();
        setProducts((prev) => [added, ...prev]);

        setShowAddForm(false);
        setNewProduct({
          cropName: '',
          price: '',
          quantity: '',
          location: '',
          category: 'vegetables',
        });

        toast({ title: 'Product added successfully' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE PRODUCT
  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({ title: 'Deleted successfully' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">
          {isFarmer ? 'Farmer Dashboard' : 'Buyer Dashboard'}
        </h1>

        {/* ADD PRODUCT */}
        {isFarmer && (
          <>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="mt-4">
              <Plus /> Add Product
            </Button>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
                <Input
                  placeholder="Crop Name"
                  value={newProduct.cropName}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, cropName: e.target.value })
                  }
                />

                <Input
                  placeholder="Price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />

                <Input
                  placeholder="Quantity"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                />

                <Input
                  placeholder="Location"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                />

                <Input
                  type="file"
                  onChange={(e) =>
                    setImageFile(e.target.files ? e.target.files[0] : null)
                  }
                />

                <Button type="submit">Save</Button>
              </form>
            )}
          </>
        )}

        {/* PRODUCTS */}
        <div className="mt-6">
          {products.length === 0 ? (
            <p>No products</p>
          ) : (
            products.map((p) => (
              <div key={p._id} className="border p-3 mb-2 flex justify-between rounded">
                <div>
                  <h3 className="font-semibold">{p.cropName}</h3>
                  <p>₹{p.price}</p>
                </div>

                <Button onClick={() => handleDeleteProduct(p._id)}>
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* ORDERS */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Orders</h2>

          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="border p-4 mb-3 rounded shadow-sm">
                <p className="font-medium">Product: {o.productId}</p>
                <p className="text-sm text-gray-500">Status: {o.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
 
