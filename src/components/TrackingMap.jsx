import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

export default function TrackingMap() {
  const [position, setPosition] = useState([13.0827, 80.2707]); // default
  const [devices, setDevices] = useState([]);

  // 📍 Get current user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition([lat, lng]);

        // 🔥 Send to backend
        fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
      });
    }
  }, []);

  // 📡 Fetch tracked devices
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/tracking");
      const data = await res.json();
      setDevices(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "350px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer center={position} zoom={13} style={{ height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {/* 🧍 Current User */}
        <Marker position={position}>
          <Popup>You (Farmer)</Popup>
        </Marker>

        {/* 🚜 Other Devices */}
        {devices.map((d, i) => (
          <Marker key={i} position={[d.lat, d.lng]}>
            <Popup>
              {d.name || "Device"} <br />
              Last update: {new Date(d.updatedAt).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}