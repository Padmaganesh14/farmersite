import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

interface Location {
  lat: number;
  lng: number;
}

interface Delivery {
  orderId: string;
  productName: string;
  status: string;
  currentLocation?: Location;
}

interface OrderMapProps {
  deliveries: Delivery[];
}

export default function OrderMap({ deliveries }: OrderMapProps) {
  if (!deliveries || deliveries.length === 0) return null;

  const valid = deliveries.find(d => d.currentLocation);
  const center: [number, number] = valid && valid.currentLocation
    ? [valid.currentLocation.lat, valid.currentLocation.lng]
    : [13.0827, 80.2707];

  return (
    <div style={{ height: "400px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer center={center} zoom={10} style={{ height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {deliveries.map((d) => {
          if (!d.currentLocation) return null;

          return (
            <Marker
              key={d.orderId}
              position={[d.currentLocation.lat, d.currentLocation.lng]}
            >
              <Popup>
                🚜 {d.productName} <br />
                Status: {d.status}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}