import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Phone,
  Package,
  Loader,
  AlertCircle,
  Eye,
  X,
  Filter,
} from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Order {
  _id: string;
  product: {
    cropName: string;
    price: number;
    farmer: {
      _id: string;
      name: string;
      phone: string;
    };
  };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  expectedDelivery?: string;
  deliveredAt?: string;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending', icon: Clock },
  accepted: { color: 'bg-blue-100', text: 'text-blue-800', label: '✅ Accepted', icon: CheckCircle2 },
  shipped: { color: 'bg-indigo-100', text: 'text-indigo-800', label: '📦 Shipped', icon: Package },
  out_for_delivery: { color: 'bg-orange-100', text: 'text-orange-800', label: '🚚 On Way', icon: TrendingUp },
  delivered: { color: 'bg-green-100', text: 'text-green-800', label: '✨ Delivered', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-100', text: 'text-red-800', label: '❌ Cancelled', icon: X },
};

export default function BuyerOrderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = user?.token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get('http://localhost:5000/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.data || response.data);
      console.log('✅ Loaded', response.data.data?.length || response.data.length, 'orders');
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = user?.token;
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/orders/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(response.data.data);
    } catch (err: any) {
      console.error('❌ Error fetching stats:', err);
    }
  };

  // Filter and search
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((o) => o.status === filter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.product.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filter, searchTerm]);

  useEffect(() => {
    if (user?.role === 'buyer') {
      fetchOrders();
      fetchStats();
    }
  }, [user]);

  // Check authorization
  if (user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-lg font-semibold">Only buyers can access this page</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your farm product orders in real-time</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} color="bg-blue-600" />
          <StatCard label="Pending" value={stats.pending} color="bg-yellow-600" />
          <StatCard label="Accepted" value={stats.accepted} color="bg-indigo-600" />
          <StatCard label="Shipped" value={stats.shipped} color="bg-purple-600" />
          <StatCard label="On Way" value={stats.outForDelivery} color="bg-orange-600" />
          <StatCard label="Delivered" value={stats.delivered} color="bg-green-600" />
          <StatCard
            label="Revenue"
            value={`₹${stats.totalRevenue}`}
            color="bg-emerald-600"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search by crop name or farmer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">On Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        )}

        {/* No Orders */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16 bg-card rounded-lg border">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-semibold text-gray-600 mb-4">No orders yet</p>
            <Button onClick={() => navigate('/marketplace')} className="bg-green-600 hover:bg-green-700">
              Start Shopping
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-card rounded-lg border">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-semibold text-gray-600">No matching orders found</p>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewTracking={() => navigate(`/tracking/${order._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

/**
 * Statistic Card Component
 */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`${color} text-white p-4 rounded-lg`}>
      <p className="text-xs font-semibold opacity-90 mb-2">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

/**
 * Order Card Component
 */
function OrderCard({
  order,
  onViewTracking,
}: {
  order: Order;
  onViewTracking: () => void;
}) {
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
      {/* Status Badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${config.color} ${config.text}`}>
        <div className="flex items-center gap-2">
          <StatusIcon size={16} />
          {config.label}
        </div>
      </div>

      {/* Product Info */}
      <h3 className="text-xl font-bold mb-2">{order.product.cropName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Quantity: <span className="font-semibold">{order.quantity} units</span>
      </p>

      {/* Farmer Info */}
      <div className="space-y-2 mb-4 pb-4 border-b">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">👨‍🌾 Farmer:</span>
          <span>{order.product.farmer.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} />
          <span>{order.product.farmer.phone}</span>
        </div>
      </div>

      {/* Price and Dates */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Price:</span>
          <span className="text-lg font-bold text-green-600">₹{order.totalPrice}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
          {order.deliveredAt && (
            <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={onViewTracking}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Eye size={18} className="mr-2" />
        View Tracking
      </Button>
    </div>
  );
}
