import { useState, useEffect } from 'react';
import { AlertCircle, Loader, Filter, Package } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import OrderTracker from '@/components/OrderTracker';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { API_URL } from '@/config';

interface Order {
  _id: string;
  buyer: { _id: string; name: string; email: string };
  product: { _id: string; cropName: string; price: number; image: string };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  expectedDelivery?: string;
  deliveredAt?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  const isFarmer = user?.role === 'farmer';
  const token = user?.token;

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setOrders(response.data.data || response.data);
      console.log(`✅ Loaded ${response.data.length || 0} orders`);
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const statusFilters = [
    { key: 'all' as const, label: 'All', count: statusCounts.all, color: 'bg-gray-100 text-gray-800' },
    { key: 'pending' as const, label: 'Pending', count: statusCounts.pending, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'accepted' as const, label: 'Accepted', count: statusCounts.accepted, color: 'bg-blue-100 text-blue-800' },
    { key: 'shipped' as const, label: 'Shipped', count: statusCounts.shipped, color: 'bg-purple-100 text-purple-800' },
    {
      key: 'out_for_delivery' as const,
      label: 'Out for Delivery',
      count: statusCounts.out_for_delivery,
      color: 'bg-orange-100 text-orange-800',
    },
    { key: 'delivered' as const, label: 'Delivered', count: statusCounts.delivered, color: 'bg-green-100 text-green-800' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please Login</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to view orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isFarmer ? 'Orders Received' : 'My Orders'}
          </h1>
          <p className="text-gray-600">
            {isFarmer ? 'Manage orders for your products' : 'Track your order status and delivery'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading orders</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchOrders}
              className="ml-auto text-red-700 hover:text-red-900 font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {statusFilters.map(status => (
              <button
                key={status.key}
                onClick={() => setFilter(status.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                  filter === status.key
                    ? `${status.color} ring-2 ring-offset-2 ring-gray-400`
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-current bg-opacity-20 text-xs font-bold">
                  {status.count}
                </span>
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter.replace(/_/g, ' ')} orders`}
            </p>
            <p className="text-sm text-gray-500">
              {isFarmer
                ? 'Farmers will see orders from buyers here'
                : 'Start shopping to create your first order'}
            </p>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderTracker
                key={order._id}
                order={order}
                isFarmer={isFarmer}
                showUpdateButton={isFarmer}
                onUpdateStatus={fetchOrders}
              />
            ))}
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{statusCounts.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Delivered</p>
              <p className="text-3xl font-bold text-green-700">{statusCounts.delivered}</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
