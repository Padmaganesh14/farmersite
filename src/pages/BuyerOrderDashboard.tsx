import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Package,
  Loader,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LiveTrackerMap from '@/components/LiveTrackerMap';

interface Order {
  _id: string;
  product: {
    cropName: string;
    price: number;
    farmer: {
      _id: string;
      name: string;
    };
  };
  quantity: number;
  totalPrice: number;
  status:
    | 'pending'
    | 'accepted'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
}

export default function BuyerOrderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    const token = user?.token;
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'buyer') {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setFilteredOrders(
      orders.filter((o) =>
        o.product.cropName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [orders, searchTerm]);

  const trackableOrder = orders.find(
    (o) => o.status === 'out_for_delivery'
  );

  if (user?.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* 🔥 LIVE TRACKER PREVIEW */}
        {trackableOrder && (
          <div className="mb-8 bg-card p-4 rounded-xl border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPin size={18} /> Live Tracking
              </h3>

              <Button
                size="sm"
                onClick={() =>
                  navigate(`/live-tracker/${trackableOrder._id}`)
                }
              >
                <Eye size={14} className="mr-1" />
                Full Screen
              </Button>
            </div>

            <LiveTrackerMap orderId={trackableOrder._id} />
          </div>
        )}

        {/* SEARCH */}
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6"
        />

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center">
            <Loader className="animate-spin" />
          </div>
        )}

        {/* ORDERS */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4">
                <h3 className="font-bold">
                  {order.product.cropName}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Farmer: {order.product.farmer.name}
                </p>

                <p className="font-semibold mt-2">
                  ₹{order.totalPrice}
                </p>

                {/* 🔥 SMART BUTTON */}
                {order.status === 'out_for_delivery' ? (
                  <Button
                    className="mt-3 w-full bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      navigate(`/live-tracker/${order._id}`)
                    }
                  >
                    🚚 Track Order
                  </Button>
                ) : order.status === 'accepted' ? (
                  <Button disabled className="mt-3 w-full">
                    Preparing Order
                  </Button>
                ) : (
                  <Button disabled className="mt-3 w-full">
                    Waiting for Farmer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}