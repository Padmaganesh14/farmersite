import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, AlertCircle, Loader, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StartDeliveryTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [formData, setFormData] = useState({
    driverName: '',
    driverPhone: '',
    vehicleType: 'bike',
    licensePlate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const vehicleTypes = [
    { value: 'motorcycle', label: '🏍️ Motorcycle' },
    { value: 'bike', label: '🚲 Bike' },
    { value: 'auto', label: '🛵 Auto Rickshaw' },
    { value: 'truck', label: '🚚 Truck' },
    { value: 'van', label: '🚐 Van' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate fields
      if (!formData.driverName.trim()) {
        throw new Error('Driver name is required');
      }
      if (!formData.driverPhone.trim()) {
        throw new Error('Driver phone is required');
      }
      if (!/^\d{10}$/.test(formData.driverPhone.replace(/\D/g, ''))) {
        throw new Error('Phone number must be 10 digits');
      }

      console.log('📤 Starting delivery tracking...');

      const response = await axios.post(
        `http://localhost:5000/api/tracking/start/${orderId}`,
        {
          driverName: formData.driverName.trim(),
          driverPhone: formData.driverPhone.trim(),
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Tracking started:', response.data);
      setSuccess(true);

      // Redirect to live tracking page
      setTimeout(() => {
        navigate(`/tracking/${orderId}`);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start tracking';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl card-shadow rounded-2xl border border-border bg-card p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-center text-3xl font-bold mb-2">Start Delivery Tracking</h1>
          <p className="text-center text-muted-foreground mb-8">
            Enter truck and driver details to begin live tracking
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-800">Success!</p>
                <p className="text-green-700 text-sm">Tracking started. Redirecting to live map...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Name */}
              <div>
                <Label htmlFor="driverName" className="text-base font-medium">
                  Driver Name
                </Label>
                <Input
                  id="driverName"
                  name="driverName"
                  type="text"
                  placeholder="Enter driver name"
                  value={formData.driverName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="mt-2"
                />
              </div>

              {/* Driver Phone */}
              <div>
                <Label htmlFor="driverPhone" className="text-base font-medium">
                  Driver Phone
                </Label>
                <Input
                  id="driverPhone"
                  name="driverPhone"
                  type="tel"
                  placeholder="Enter 10-digit phone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  maxLength={10}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <Label htmlFor="vehicleType" className="text-base font-medium">
                Vehicle Type
              </Label>
              <Select value={formData.vehicleType} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, vehicleType: value }));
              }}>
                <SelectTrigger className="mt-2" disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* License Plate */}
            <div>
              <Label htmlFor="licensePlate" className="text-base font-medium">
                License Plate <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                type="text"
                placeholder="e.g., DL-01-AB-1234"
                value={formData.licensePlate}
                onChange={handleChange}
                disabled={loading}
                className="mt-2"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <MapPin className="inline mr-2" size={16} />
                Once you start tracking, the buyer will be able to see the truck's real-time location on the map.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 animate-spin" size={18} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2" size={18} />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-8 pt-8 border-t">
            <p className="font-semibold text-sm mb-4">💡 Tips:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Ensure GPS is enabled on the delivery vehicle</li>
              <li>• Keep the tracking app open during delivery</li>
              <li>• Update location every 30 seconds for accurate tracking</li>
              <li>• Buyer will receive live location updates</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
