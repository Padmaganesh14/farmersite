import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🚚 Truck icon
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743131.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// 🔥 Map updater component
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);

  return null;
}

interface LiveTrackerMapProps {
  orderId: string;
}

export default function LiveTrackerMap({ orderId }: LiveTrackerMapProps) {
  const [position, setPosition] = useState<[number, number]>([13.0827, 80.2707]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const userData = savedUser ? JSON.parse(savedUser) : null;
        const token = userData?.token;
        
        if (!token) {
          console.warn("⏳ No token found, skipping tracking fetch");
          return;
        }
        
        const res = await fetch(`http://localhost:5000/api/tracking/${orderId}/live`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data?.currentLocation) {
          setPosition([data.currentLocation.lat, data.currentLocation.lng]);
        } else if (data?.vehicleLocation) {
          setPosition([data.vehicleLocation.lat, data.vehicleLocation.lng]);
        }
      } catch (error) {
        console.error("❌ Error fetching location:", error);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height: "400px" }}>
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        
        {/* 🔥 This fixes movement */}
        <RecenterMap position={position} />

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={truckIcon} />
      </MapContainer>
    </div>
  );
}