import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

// ✅ ONLY KEEP THIS (REMOVE duplicate import)
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isFarmer = user.role === 'farmer';

  const fetchData = async () => {
    if (!user?.token) return;

    try {
      const orderRes = await fetch(`${API_URL}/api/orders/my`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (orderRes.ok) {
        const data = await orderRes.json();
        const ordersArray = data.data || data.orders || (Array.isArray(data) ? data : []);
        setOrders(ordersArray);
      }

      if (isFarmer) {
        const prodRes = await fetch(`${API_URL}/api/products`);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || (Array.isArray(data) ? data : []));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const endpoint =
        status === 'accepted'
          ? `${API_URL}/api/orders/${orderId}/accept`
          : `${API_URL}/api/orders/${orderId}/status`;

      const method = status === 'accepted' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: method === 'PUT' ? JSON.stringify({ status }) : undefined,
      });

      if (res.ok) {
        toast({ title: `Order ${status} successfully` });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  };

  const handleStartDelivery = async (orderId: string) => {
    if (!orderId || orderId === 'undefined') {
      toast({ title: 'Order ID is missing. Please refresh and try again.', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/tracking/start/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          driverName: 'Local Driver',
          driverPhone: '9876543210',
          vehicleType: 'truck',
        }),
      });

      if (res.ok) {
        toast({ title: 'Delivery started and tracking is live!' });
        fetchData();
        navigate(`/live-tracker/${orderId}`);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to start delivery', variant: 'destructive' });
    }
  };

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

      const res = await fetch(`${API_URL}/api/products/add`, {
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

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
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

        {isFarmer && (
          <>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="mt-4">
              <Plus /> Add Product
            </Button>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
                <Input placeholder="Crop Name" value={newProduct.cropName}
                  onChange={(e) => setNewProduct({ ...newProduct, cropName: e.target.value })}
                />
                <Input placeholder="Price" type="number" value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <Input placeholder="Quantity" value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                />
                <Input placeholder="Location" value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                />
                <Input type="file"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                />
                <Button type="submit">Save</Button>
              </form>
            )}
          </>
        )}

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

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Orders Received</h2>

          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="border p-4 mb-3 rounded flex justify-between">
                <div>
                  <h3>{o.product?.cropName}</h3>
                  <p>Status: {o.status}</p>
                </div>

                <div className="flex gap-2">
                  {o.status === 'pending' && (
                    <Button onClick={() => handleUpdateStatus(o._id, 'accepted')}>
                      Accept
                    </Button>
                  )}

                  {o.status === 'accepted' && (
                    <Button onClick={() => handleStartDelivery(o._id)}>
                      Start Delivery
                    </Button>
                  )}

                  {(o.status === 'shipped' || o.status === 'out_for_delivery') && (
                    <Button onClick={() => {
                      if (o._id && o._id !== 'undefined') {
                        navigate(`/live-tracker/${o._id}`);
                      } else {
                        toast({ title: 'Order ID is missing. Please refresh.', variant: 'destructive' });
                      }
                    }}>
                      Track
                    </Button>
                  )}
                </div>
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