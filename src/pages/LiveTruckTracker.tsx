import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Phone, Truck, Clock, Navigation } from "lucide-react";
import LiveTrackerMap from "@/components/LiveTrackerMap";

interface Location {
  lat: number;
  lng: number;
}

interface Order {
  id: string;
  driverName: string;
  driverPhone: string;
  truckNumber: string;
  status: "in-transit" | "delivered" | "delayed";
  eta: string;
  origin: Location;
  destination: Location;
  current: Location;
  distanceRemaining: number;
  timeRemaining: string;
}

export default function LiveTruckTracker() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order>({
    id: id || "",
    driverName: "Raj Kumar",
    driverPhone: "+91 98765 43210",
    truckNumber: "KL-01-AB-1234",
    status: "in-transit",
    eta: "2:30 PM",
    origin: { lat: 10.8505, lng: 76.2711 },
    destination: { lat: 12.9716, lng: 77.5946 },
    current: { lat: 11.5, lng: 77.0 },
    distanceRemaining: 245,
    timeRemaining: "4 hours 30 mins",
  });

  const [darkMode, setDarkMode] = useState(false);

  const statusColors = {
    "in-transit": "bg-blue-100 text-blue-800 border-blue-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    delayed: "bg-red-100 text-red-800 border-red-300",
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardColor = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";

  // 🔄 OPTIONAL: fetch real order details
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`);
        const data = await res.json();

        if (data) {
          setOrder((prev) => ({
            ...prev,
            id: data._id,
            driverName: data.driverName || prev.driverName,
            driverPhone: data.driverPhone || prev.driverPhone,
          }));
        }
      } catch (err) {
        console.log("Order fetch failed (using demo data)");
      }
    };

    fetchOrder();
  }, [id]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Invalid Order ID</p>
      </div>
    );
  }

  return (
    <div className={`${bgColor} min-h-screen transition-colors duration-300`}>
      {/* Header */}
      <div className={`${cardColor} shadow-lg sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${textColor}`}>
              Live Order Tracking
            </h1>
            <p className={secondaryText}>Order {order.id}</p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              darkMode
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-white"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 🗺️ MAP SECTION (FIXED) */}
          <div className="lg:col-span-2">
            <div className={`${cardColor} rounded-2xl shadow-lg p-4`}>
              
              {/* ✅ REAL LEAFLET MAP */}
              <LiveTrackerMap orderId={order.id} />

              <div className="flex justify-between mt-3">
                <p className={`${secondaryText} text-sm`}>
                  📍 Auto-updating every 3 seconds
                </p>
                <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                  🔴 Live
                </span>
              </div>
            </div>

            {/* Journey Info */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6 mt-6`}>
              <h2 className={`text-xl font-bold ${textColor} mb-4`}>
                Journey Details
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <MapPin className="text-green-500" />
                  <div>
                    <p className={secondaryText}>Start</p>
                    <p className={textColor}>Kochi</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Truck className="text-blue-500 animate-bounce" />
                  <div>
                    <p className={secondaryText}>Current</p>
                    <p className={textColor}>In Transit</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Navigation className="text-red-500" />
                  <div>
                    <p className={secondaryText}>Destination</p>
                    <p className={textColor}>Bangalore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">

            {/* Status */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>
                Status
              </h3>

              <div className={`p-3 rounded-lg border text-center font-bold ${statusColors[order.status]}`}>
                🚚 In Transit
              </div>
            </div>

            {/* Driver Info */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>
                Driver Info
              </h3>

              <p className={textColor}>{order.driverName}</p>

              <a href={`tel:${order.driverPhone}`} className="text-blue-500">
                <Phone size={16} className="inline mr-2" />
                {order.driverPhone}
              </a>

              <p className={textColor}>{order.truckNumber}</p>
            </div>

            {/* ETA */}
            <div className={`${cardColor} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>
                ETA
              </h3>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                <Clock className="inline mr-2" />
                <span className="text-2xl font-bold">{order.eta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}