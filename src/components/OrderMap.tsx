import { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/data/mockData';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const locationCoords: Record<string, { lat: number; lng: number }> = {
  'Coimbatore, TN': { lat: 11.0168, lng: 76.9558 },
  'Thanjavur, TN': { lat: 10.787, lng: 79.1378 },
  'Salem, TN': { lat: 11.6643, lng: 78.146 },
  'Erode, TN': { lat: 11.341, lng: 77.7172 },
  'Madurai, TN': { lat: 9.9252, lng: 78.1198 },
  'Trichy, TN': { lat: 10.7905, lng: 78.7047 },
  'Chennai, TN': { lat: 13.0827, lng: 80.2707 },
};

function getTruckPosition(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  status: Order['status']
): { lat: number; lng: number } {
  const ratio = 
    status === 'pending' ? 0 : 
    status === 'shipped' ? 0.45 : 
    status === 'out_for_delivery' ? 0.85 : 1;
  return {
    lat: origin.lat + (destination.lat - origin.lat) * ratio,
    lng: origin.lng + (destination.lng - origin.lng) * ratio,
  };
}

const containerStyle = { width: '100%', height: '300px' };

interface OrderMapProps {
  order: Order;
}

const OrderMap = ({ order }: OrderMapProps) => {
  const { t } = useLanguage();
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const farmLocation = (() => {
    if (order.farmerName === 'Rajan Kumar') return locationCoords['Coimbatore, TN'];
    if (order.farmerName === 'Muthu Vel') return locationCoords['Salem, TN'];
    if (order.farmerName === 'Lakshmi Devi') return locationCoords['Erode, TN'];
    return locationCoords['Coimbatore, TN'];
  })();

  const buyerLocation = locationCoords['Chennai, TN'];
  const truckPos = getTruckPosition(farmLocation, buyerLocation, order.status);

  const statusColors: Record<Order['status'], string> = {
    pending: '#f59e0b',
    shipped: '#3b82f6',
    out_for_delivery: '#f97316',
    delivered: '#22c55e',
  };

  const center = {
    lat: (farmLocation.lat + buyerLocation.lat) / 2,
    lng: (farmLocation.lng + buyerLocation.lng) / 2,
  };

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(farmLocation);
    bounds.extend(buyerLocation);
    if (order.status !== 'pending') bounds.extend(truckPos);
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [farmLocation, buyerLocation, truckPos, order.status]);

  if (!isLoaded) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-border bg-muted">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-card px-4 py-2 border-b border-border">
        <span className="text-sm font-medium text-foreground">{t('order.trackOrder')}: {order.id}</span>
        <span
          className="rounded-full px-3 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `${statusColors[order.status]}20`,
            color: statusColors[order.status],
          }}
        >
          {t(`order.${order.status}`)}
        </span>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        {/* Dashed route line */}
        <Polyline
          path={[farmLocation, buyerLocation]}
          options={{
            strokeColor: '#94a3b8',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            icons: [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
              offset: '0',
              repeat: '15px',
            }],
          }}
        />

        {/* Traveled path */}
        <Polyline
          path={[farmLocation, truckPos]}
          options={{
            strokeColor: statusColors[order.status],
            strokeOpacity: 1,
            strokeWeight: 4,
          }}
        />

        {/* Farm marker */}
        <Marker
          position={farmLocation}
          label={{ text: '🌾', fontSize: '20px' }}
          onClick={() => setActiveMarker('farm')}
        >
          {activeMarker === 'farm' && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div style={{ padding: '4px' }}>
                <strong>🌾 {order.farmerName}</strong><br />
                <span style={{ fontSize: '12px', color: '#666' }}>Farm Origin</span>
              </div>
            </InfoWindow>
          )}
        </Marker>

        {/* Truck marker */}
        {order.status !== 'pending' && (
          <Marker
            position={truckPos}
            label={{ text: '🚛', fontSize: '22px' }}
            onClick={() => setActiveMarker('truck')}
          >
            {activeMarker === 'truck' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: '4px' }}>
                  <strong>🚛 {order.productName}</strong><br />
                  <span style={{ fontSize: '12px', color: statusColors[order.status] }}>
                    {t(`order.${order.status}`)}
                  </span>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Buyer marker */}
        <Marker
          position={buyerLocation}
          label={{ text: '📍', fontSize: '20px' }}
          onClick={() => setActiveMarker('buyer')}
        >
          {activeMarker === 'buyer' && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div style={{ padding: '4px' }}>
                <strong>📍 {order.buyerName}</strong><br />
                <span style={{ fontSize: '12px', color: '#666' }}>Delivery Destination</span>
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
    </div>
  );
};

export default OrderMap;
