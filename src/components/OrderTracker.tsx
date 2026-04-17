import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, MapPin, CheckCircle2, ExternalLink, Navigation, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

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

interface OrderTrackerProps {
  order: Order;
  onUpdateStatus?: () => void;
  showUpdateButton?: boolean;
  isFarmer?: boolean;
}

type StatusStep = { key: Order['status']; label: string; icon: any };

const STEPS: StatusStep[] = [
  { key: 'pending', label: 'Pending', icon: Package },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_BG: Record<Order['status'], string> = {
  pending: 'bg-yellow-50',
  accepted: 'bg-blue-50',
  shipped: 'bg-purple-50',
  out_for_delivery: 'bg-orange-50',
  delivered: 'bg-green-50',
  cancelled: 'bg-red-50',
};

const getNextStatus = (current: Order['status']): Order['status'] | null => {
  const nextMap: Record<Order['status'], Order['status'] | null> = {
    pending: 'accepted',
    accepted: 'shipped',
    shipped: 'out_for_delivery',
    out_for_delivery: 'delivered',
    delivered: null,
    cancelled: null,
  };
  return nextMap[current];
};

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderTracker = ({ order, onUpdateStatus, showUpdateButton, isFarmer }: OrderTrackerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStatusIndex = STEPS.findIndex(s => s.key === order.status);
  const nextStatus = getNextStatus(order.status);

  const handleUpdateStatus = async () => {
    if (!nextStatus) {
      setError('Order is already in final state');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${order._id}`,
        { status: nextStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log(`✅ Order updated to ${nextStatus}`);
      onUpdateStatus?.();
    } catch (err: any) {
      console.error('❌ Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 p-6 shadow-sm ${STATUS_BG[order.status]}`}>
      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Header: Product info + Status badge */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-3">
          {order.product.image && (
            <img
              src={order.product.image}
              alt={order.product.cropName}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{order.product.cropName}</h3>
            <p className="text-sm text-gray-600">
              Quantity: <span className="font-medium">{order.quantity}</span>
            </p>
            <p className="text-sm text-gray-600">
              Farmer: <span className="font-medium">{order.buyer.name}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
          <p className="mt-2 text-lg font-bold text-gray-900">₹{order.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Status progress indicator */}
      <div className="mb-4">
        <div className="flex gap-2">
          {STEPS.slice(0, 5).map((step, i) => {
            const isCompleted = i <= currentStatusIndex;
            return (
              <div key={step.key} className="flex flex-1 flex-col items-center">
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-100 text-green-700'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p className={`text-center text-xs font-medium ${isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${((currentStatusIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-white p-3">
        <div>
          <p className="text-xs font-semibold text-gray-600">ORDERED</p>
          <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600">EXPECTED DELIVERY</p>
          <p className="text-sm text-gray-900">{formatDate(order.expectedDelivery)}</p>
        </div>
        {order.deliveredAt && (
          <div>
            <p className="text-xs font-semibold text-gray-600">DELIVERED</p>
            <p className="text-sm text-green-700 font-medium">{formatDate(order.deliveredAt)}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {isFarmer && showUpdateButton && nextStatus && (
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark as {nextStatus.replace(/_/g, ' ')}
              </>
            )}
          </button>
        )}

        <Link
          to={`/order-tracking/${order._id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
        >
          <Navigation className="h-4 w-4" />
          Live Tracking
        </Link>
      </div>
    </div>
  );
};

export default OrderTracker;

  const currentIdx = STATUS_INDEX[order.status];
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="card-shadow animate-fade-in rounded-xl border border-border bg-card p-4">

      {/* ── Top row: product + actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={order.productImage}
            alt={order.productName}
            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
          />
          <div>
            <h4 className="font-heading font-semibold text-foreground">{order.productName}</h4>
            <p className="text-xs text-muted-foreground">
              {order.id} · {order.quantity}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status badge */}
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}>
            {STEPS[currentIdx].label.toUpperCase()}
          </span>

          {/* Live Tracking button */}
          {order.status !== 'pending' && order.status !== 'delivered' && (
            <Link
              to={`/order-tracking/${order.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live Tracking
            </Link>
          )}

          {/* Quick map toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              showMap ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground hover:bg-primary/10'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {t('order.trackOrder')}
          </button>

          <div className="text-right">
            <p className="font-heading text-lg font-bold text-primary">₹{order.total}</p>
            <p className="text-xs text-muted-foreground">{order.date}</p>
          </div>
        </div>
      </div>

      {/* ── Progress stepper ── */}
      <div className="relative mt-5">
        {/* connector */}
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-start justify-between">
          {STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const Icon = STEP_ICONS[i];
            return (
              <div key={step.key} className="z-10 flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-center text-[10px] font-semibold leading-tight max-w-[55px] ${
                  done ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Inline map ── */}
      {showMap && (
        <div className="mt-4 animate-slide-up">
          <OrderMap order={order} />
        </div>
      )}

      {/* ── Farmer update button ── */}
      {showUpdateButton && nextStatus && (
        <button
          onClick={() => onUpdateStatus?.(order.id, nextStatus)}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {t('order.updateStatus')}: {STEPS[STATUS_INDEX[nextStatus]].label}
        </button>
      )}
    </div>
  );
};

export default OrderTracker;
