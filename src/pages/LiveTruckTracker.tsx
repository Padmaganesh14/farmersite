import { useState, useEffect } from 'react';
import { MapPin, Phone, Truck, Clock, Navigation } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface Order {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  truckNumber: string;
  status: 'in-transit' | 'delivered' | 'delayed';
  eta: string;
  origin: Location;
  destination: Location;
  current: Location;
  distanceRemaining: number;
  timeRemaining: string;
}

export default function LiveTruckTracker() {
  const [order, setOrder] = useState<Order>({
    id: 'ORD-12345',
    driverId: 'DRV-001',
    driverName: 'Raj Kumar',
    driverPhone: '+91 98765 43210',
    truckNumber: 'KL-01-AB-1234',
    status: 'in-transit',
    eta: '2:30 PM',
    origin: { lat: 10.8505, lng: 76.2711 }, // Kochi
    destination: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    current: { lat: 11.5, lng: 77.0 },
    distanceRemaining: 245,
    timeRemaining: '4 hours 30 mins',
  });

  const [darkMode, setDarkMode] = useState(false);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setOrder(prev => ({
        ...prev,
        current: {
          lat: prev.current.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.current.lng + (Math.random() - 0.5) * 0.01,
        },
        distanceRemaining: Math.max(0, prev.distanceRemaining - Math.random() * 2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Generate map URL with route
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${order.current.lat},${order.current.lng}&zoom=8&size=800x600&markers=color:green%7Clabel:S%7C${order.origin.lat},${order.origin.lng}&markers=color:red%7Clabel:D%7C${order.destination.lat},${order.destination.lng}&markers=color:blue%7Clabel:T%7C${order.current.lat},${order.current.lng}&path=color:0x0000ff80%7Cweight:3%7C${order.origin.lat},${order.origin.lng}%7C${order.current.lat},${order.current.lng}%7C${order.destination.lat},${order.destination.lng}&key=${apiKey}`;

  const statusColors = {
    'in-transit': 'bg-blue-100 text-blue-800 border-blue-300',
    'delivered': 'bg-green-100 text-green-800 border-green-300',
    'delayed': 'bg-red-100 text-red-800 border-red-300',
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${bgColor} min-h-screen transition-colors duration-300`}>
      {/* Header */}
      <div className={`${cardColor} shadow-lg sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${textColor}`}>Live Order Tracking</h1>
            <p className={secondaryText}>Order {order.id}</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              darkMode
                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className={`${cardColor} rounded-2xl shadow-lg overflow-hidden`}>
              <img
                src={mapUrl}
                alt="Live Tracker Map"
                className="w-full h-96 object-cover animate-pulse"
              />
              <div className="p-4 flex justify-between items-center">
                <p className={`${secondaryText} text-sm`}>📍 Last updated: just now</p>
                <button
                  onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    isLiveUpdating
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {isLiveUpdating ? '🔴 Live' : '⚪ Paused'}
                </button>
              </div>
            </div>

            {/* Journey Info */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6 mt-6`}>
              <h2 className={`text-xl font-bold ${textColor} mb-4`}>Journey Details</h2>
              <div className="space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 rounded-full p-3 text-white">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className={secondaryText}>Start Location</p>
                    <p className={`font-bold ${textColor}`}>Kochi, Kerala</p>
                    <p className={secondaryText}>📍 {order.origin.lat.toFixed(4)}, {order.origin.lng.toFixed(4)}</p>
                  </div>
                </div>

                {/* Current */}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 rounded-full p-3 text-white animate-bounce">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className={secondaryText}>Current Location</p>
                    <p className={`font-bold ${textColor}`}>In Transit</p>
                    <p className={secondaryText}>📍 {order.current.lat.toFixed(4)}, {order.current.lng.toFixed(4)}</p>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 rounded-full p-3 text-white">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className={secondaryText}>Destination</p>
                    <p className={`font-bold ${textColor}`}>Bangalore, Karnataka</p>
                    <p className={secondaryText}>📍 {order.destination.lat.toFixed(4)}, {order.destination.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>Status</h3>
              <div className={`px-4 py-3 rounded-lg border-2 text-center font-bold ${statusColors[order.status]}`}>
                {order.status === 'in-transit' && '🚚 In Transit'}
                {order.status === 'delivered' && '✅ Delivered'}
                {order.status === 'delayed' && '⚠️ Delayed'}
              </div>
            </div>

            {/* Driver Info */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>Driver Info</h3>
              <div className="space-y-3">
                <div>
                  <p className={secondaryText}>Name</p>
                  <p className={`font-bold ${textColor}`}>{order.driverName}</p>
                </div>
                <div>
                  <p className={secondaryText}>Phone</p>
                  <a href={`tel:${order.driverPhone}`} className="font-bold text-blue-500 hover:underline">
                    <Phone size={16} className="inline mr-2" />
                    {order.driverPhone}
                  </a>
                </div>
                <div>
                  <p className={secondaryText}>Truck Number</p>
                  <p className={`font-bold ${textColor} text-lg`}>{order.truckNumber}</p>
                </div>
              </div>
            </div>

            {/* ETA Card */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>Estimated Arrival</h3>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} />
                  <p className="text-sm opacity-90">ETA</p>
                </div>
                <p className="text-3xl font-bold">{order.eta}</p>
              </div>
            </div>

            {/* Distance & Time */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>Journey Progress</h3>
              <div className="space-y-4">
                <div>
                  <p className={secondaryText}>Distance Remaining</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{order.distanceRemaining.toFixed(1)} km</p>
                </div>
                <div>
                  <p className={secondaryText}>Time Remaining</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{order.timeRemaining}</p>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${100 - (order.distanceRemaining / 490) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
