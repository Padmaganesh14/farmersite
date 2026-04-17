# 🚚 Truck Tracking - Quick API Reference

## 🚀 Quick Start

### 1. Start Truck Tracking
```bash
curl -X POST http://localhost:5000/api/tracking/start/{orderId} \
  -H "Authorization: Bearer {farmer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "driverName": "Rajesh Kumar",
    "driverPhone": "9876543210",
    "vehicleType": "bike",
    "licensePlate": "DL-01-AB-1234"
  }'
```

**Response:**
```json
{
  "message": "Delivery tracking started",
  "order": { /* order details */ }
}
```

---

### 2. Update Truck Location (Every 4 Seconds)
```bash
curl -X PATCH http://localhost:5000/api/tracking/{orderId}/location \
  -H "Authorization: Bearer {farmer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.6139,
    "lng": 77.2090,
    "speedKmh": 45
  }'
```

**Response:**
```json
{
  "message": "Location updated",
  "currentLocation": {
    "lat": 28.6139,
    "lng": 77.2090,
    "timestamp": "2024-01-01T12:00:45Z"
  },
  "distanceTraveled": 5.2,
  "status": "out_for_delivery"
}
```

---

### 3. Get Live Tracking Data
```bash
curl http://localhost:5000/api/tracking/{orderId}/live \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "orderId": "order123",
  "status": "out_for_delivery",
  "truck": {
    "licensePlate": "DL-01-AB-1234",
    "driverName": "Rajesh Kumar",
    "driverPhone": "9876543210",
    "vehicleType": "bike",
    "isTracking": true
  },
  "currentLocation": { "lat": 28.6139, "lng": 77.2090 },
  "farmerLocation": { "lat": 28.5994, "lng": 77.1997 },
  "buyerLocation": { "lat": 28.6353, "lng": 77.2250 },
  "totalDistance": 15.5,
  "distanceTraveled": 8.2,
  "progressPercent": 52.9,
  "etaMinutes": 12,
  "productName": "Tomatoes",
  "buyerName": "Priya Singh",
  "buyerPhone": "9876543211",
  "lastUpdated": "2024-01-01T12:00:45Z"
}
```

---

### 4. Get Active Deliveries (Farmer)
```bash
curl http://localhost:5000/api/tracking/farmer/active \
  -H "Authorization: Bearer {farmer_token}"
```

**Response:**
```json
{
  "count": 3,
  "orders": [
    {
      "orderId": "order123",
      "status": "out_for_delivery",
      "buyerName": "Priya Singh",
      "productName": "Tomatoes",
      "quantity": 5,
      "currentLocation": { "lat": 28.6139, "lng": 77.2090 },
      "distanceTraveled": 8.2,
      "totalDistance": 15.5
    }
  ]
}
```

---

### 5. Complete Delivery
```bash
curl -X POST http://localhost:5000/api/tracking/{orderId}/complete \
  -H "Authorization: Bearer {farmer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://...",
    "signature": "base64...",
    "notes": "Delivered successfully"
  }'
```

**Response:**
```json
{
  "message": "Delivery completed successfully",
  "deliveryTime": {
    "started": "2024-01-01T12:00:00Z",
    "ended": "2024-01-01T12:30:00Z",
    "durationMinutes": 30
  },
  "distanceTraveled": 15.4
}
```

---

### 6. Get Tracking History
```bash
curl http://localhost:5000/api/tracking/{orderId}/history \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "orderId": "order123",
  "totalLocations": 45,
  "locationHistory": [
    {
      "lat": 28.5994,
      "lng": 77.1997,
      "timestamp": "2024-01-01T12:00:00Z",
      "speedKmh": 0
    }
  ],
  "distanceTraveled": 15.4
}
```

---

## 📱 Frontend Usage

### React Component Example
```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

export function OrderTracking({ orderId, token }) {
  const [tracking, setTracking] = useState(null);

  // Fetch live tracking every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await axios.get(
        `http://localhost:5000/api/tracking/${orderId}/live`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTracking(response.data);
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, token]);

  if (!tracking) return <div>Loading...</div>;

  return (
    <div>
      <h2>Tracking: {tracking.productName}</h2>
      <p>Driver: {tracking.truck?.driverName}</p>
      <p>Progress: {tracking.progressPercent.toFixed(1)}%</p>
      <p>ETA: {tracking.etaMinutes} minutes</p>
      <p>Distance: {tracking.distanceTraveled.toFixed(1)} km</p>
    </div>
  );
}
```

---

## 🔐 Authorization

### Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role Permissions
| Endpoint | Farmer | Buyer |
|----------|--------|-------|
| POST /tracking/start | ✅ | ❌ |
| PATCH /tracking/.../location | ✅ | ❌ |
| POST /tracking/.../complete | ✅ | ❌ |
| GET /tracking/.../live | ✅ | ✅ |
| GET /tracking/.../history | ✅ | ✅ |
| GET /tracking/farmer/active | ✅ | ❌ |

---

## ✅ Vehicle Types
- `motorcycle` - Motorcycle
- `bike` - Bicycle
- `auto` - Auto Rickshaw
- `truck` - Truck
- `van` - Van

---

## 📊 Status Flow
```
pending → accepted → shipped → out_for_delivery → delivered
                          ↑
                    Tracking starts
                    (Auto-transition on first location update)
```

---

## 🔢 Phone Validation
- Must be 10 digits
- Can include country code (e.g., +91)
- Formatting handled automatically

---

## 🗺️ Coordinates Format
```json
{
  "lat": 28.6139,      // -90 to 90
  "lng": 77.2090       // -180 to 180
}
```

---

## ⏱️ Time Format
All timestamps in ISO 8601:
```
2024-01-01T12:00:45Z
```

---

## 📏 Distance Unit
All distances in **kilometers (km)**

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide lat and lng coordinates"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to track this order"
}
```

### 404 Not Found
```json
{
  "message": "Order not found"
}
```

---

## 💡 Tips

1. **Real-Time Updates**: Send location every 4 seconds for smooth tracking
2. **Battery**: Adjust polling interval based on battery constraints
3. **Accuracy**: Use high accuracy GPS for better results
4. **Offline**: Queue location updates if offline, send when reconnected
5. **Testing**: Use Postman to test endpoints before integration

---

## 🧪 Complete Flow Example

```javascript
// 1. Start tracking
const startRes = await fetch('http://localhost:5000/api/tracking/start/order123', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer farmer_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    driverName: 'Raj',
    driverPhone: '9876543210',
    vehicleType: 'bike'
  })
});
const startData = await startRes.json();
console.log('Tracking started:', startData.message);

// 2. Update location every 4 seconds
setInterval(async () => {
  const locationRes = await fetch('http://localhost:5000/api/tracking/order123/location', {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer farmer_token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lat: getCurrentLat(),
      lng: getCurrentLng(),
      speedKmh: getCurrentSpeed()
    })
  });
  const locationData = await locationRes.json();
  console.log('Distance:', locationData.distanceTraveled, 'km');
}, 4000);

// 3. View live tracking
const liveRes = await fetch('http://localhost:5000/api/tracking/order123/live', {
  headers: { 'Authorization': 'Bearer buyer_token' }
});
const liveData = await liveRes.json();
console.log('ETA:', liveData.etaMinutes, 'minutes');
console.log('Progress:', liveData.progressPercent, '%');

// 4. Complete delivery
const completeRes = await fetch('http://localhost:5000/api/tracking/order123/complete', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer farmer_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: 'Delivered successfully'
  })
});
const completeData = await completeRes.json();
console.log('Duration:', completeData.deliveryTime.durationMinutes, 'minutes');
```

---

## 📞 Support

For more details:
1. See `TRUCK_TRACKING_GUIDE.md`
2. Check backend logs for errors
3. Verify Google Maps API key
4. Test endpoints with Postman

---

**Version:** 1.0
**Last Updated:** April 16, 2026
**Status:** ✅ Production Ready
