import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  DirectionsService,
} from '@react-google-maps/api';

/* ─── constants ───────────────── */
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_CONTAINER = { width: '100%', height: '100%' };

type LatLng = { lat: number; lng: number };

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

const TrackingPage = () => {
  const navigate = useNavigate();

  const origin: LatLng = { lat: 13.0827, lng: 80.2707 };
  const destination: LatLng = { lat: 13.0674, lng: 80.2376 };

  const [vehiclePos, setVehiclePos] = useState<LatLng>(origin);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const stepRef = useRef(0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: ['geometry', 'visualization'],
  });

  /* ─── SAFE map options ─── */
  const getMapOptions = (): google.maps.MapOptions => {
    if (!window.google) return {};

    return {
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
    };
  };

  /* ─── simulate movement ─── */
  useEffect(() => {
    const id = setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 0.01, 1);
      setVehiclePos(lerp(origin, destination, stepRef.current));
    }, 2000);

    return () => clearInterval(id);
  }, []);

  /* ─── directions ─── */
  const handleDirections = (res: google.maps.DirectionsResult | null) => {
    if (res && res.status === 'OK') {
      setDirections(res);
    }
  };

  if (!isLoaded) {
    return <div className="p-10 text-center">Loading Map...</div>;
  }

  return (
    <div className="h-screen w-full">

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER}
        center={vehiclePos}
        zoom={13}
        options={getMapOptions()}
        onLoad={(map) => setMapRef(map)}
      >

        {/* Directions */}
        {!directions && (
          <DirectionsService
            options={{
              origin,
              destination,
              travelMode: window.google.maps.TravelMode.DRIVING,
            }}
            callback={handleDirections}
          />
        )}

        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true,
            }}
          />
        )}

        {/* Origin */}
        <Marker position={origin} label="🌾" />

        {/* Destination */}
        <Marker position={destination} label="🏠" />

        {/* Truck */}
        <Marker
          position={vehiclePos}
          icon={{
            url: "https://maps.google.com/mapfiles/kml/shapes/truck.png",
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />

      </GoogleMap>

    </div>
  );
};

export default TrackingPage;