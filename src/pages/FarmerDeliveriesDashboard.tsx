import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Navigation,
  Loader,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Activity,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Delivery {
  orderId: string;
  status: string;
  buyerName: string;
  buyerPhone: string;
  productName: string;
  quantity: number;
  truck: {
    driverName: string;
    driverPhone: string;
    vehicleType: string;
    licensePlate: string;
  };
  currentLocation: { lat: number; lng: number };
  totalDistance: number;
  distanceTraveled: number;
  trackingStartedAt: string;
  estimatedArrival?: string;
}

export default function FarmerDeliveriesDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setError(null);
      const response = await axios.get(
        'http://localhost:5000/api/tracking/farmer/active',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeliveries(response.data.orders);
      console.log(`✅ Loaded ${response.data.count} active deliveries`);
    } catch (err: any) {
      console.error('❌ Error fetching deliveries:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load deliveries';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'farmer') {
      fetchDeliveries();
    }
  }, [token, user?.role]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDeliveries();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const getProgressPercent = (delivery: Delivery) => {
    if (delivery.totalDistance && delivery.distanceTraveled) {
      return Math.min((delivery.distanceTraveled / delivery.totalDistance) * 100, 100);
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
        return <Truck className="text-blue-600" size={18} />;
      case 'out_for_delivery':
        return <Navigation className="text-orange-600" size={18} />;
      case 'delivered':
        return <CheckCircle2 className="text-green-600" size={18} />;
      default:
        return <Clock className="text-gray-600" size={18} />;
    }
  };

  if (user?.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-lg font-semibold">Only farmers can access this page</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="text-blue-600" size={32} />
              Active Deliveries
            </h1>
            <p className="text-muted-foreground mt-2">
              {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'} in progress
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <RefreshCw size={16} className="mr-2" />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDeliveries()}
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin mr-2" size={16} /> : <RefreshCw size={16} />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        )}

        {/* No deliveries */}
        {!loading && deliveries.length === 0 && (
          <div className="text-center py-16 bg-card rounded-lg border">
            <Truck className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-lg font-semibold text-gray-600 mb-2">No Active Deliveries</p>
            <p className="text-gray-500 mb-6">All your deliveries are complete!</p>
            <Button onClick={() => navigate('/orders')} variant="outline">
              View All Orders
            </Button>
          </div>
        )}

        {/* Deliveries Grid */}
        {!loading && deliveries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveries.map(delivery => (
              <div
                key={delivery.orderId}
                className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className={`p-4 ${getStatusColor(delivery.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(delivery.status)}
                      <div>
                        <p className="font-semibold">{delivery.productName}</p>
                        <p className="text-sm opacity-75">
                          Qty: {delivery.quantity} | Order {delivery.orderId.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold capitalize px-2 py-1 bg-white/20 rounded-full">
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Buyer Info */}
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">BUYER</p>
                    <p className="font-semibold text-sm">{delivery.buyerName}</p>
                    <a
                      href={`tel:${delivery.buyerPhone}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Phone size={14} />
                      {delivery.buyerPhone}
                    </a>
                  </div>

                  {/* Driver Info */}
                  {delivery.truck && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">DRIVER</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Name:</span> {delivery.truck.driverName}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Vehicle:</span> {delivery.truck.vehicleType}
                        </p>
                        {delivery.truck.licensePlate && (
                          <p>
                            <span className="text-muted-foreground">Plate:</span> {delivery.truck.licensePlate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-muted-foreground font-semibold">PROGRESS</p>
                      <p className="text-xs font-semibold">
                        {delivery.distanceTraveled.toFixed(1)}
                        {delivery.totalDistance && `/${delivery.totalDistance.toFixed(1)}`} km
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${getProgressPercent(delivery)}%` }}
                      />
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Current: {delivery.currentLocation?.lat?.toFixed(4)},
                        {delivery.currentLocation?.lng?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/tracking/${delivery.orderId}`)}
                  >
                    <MapPin size={16} className="mr-1" />
                    View Map
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate(`/order/${delivery.orderId}`)}
                  >
                    Details
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
