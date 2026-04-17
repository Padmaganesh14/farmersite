# 🚚 Truck-Based Delivery Tracking System

## Overview

Complete truck-based live delivery tracking system using Google Maps for farmers to track truck locations in real-time as they deliver orders to buyers.

---

## 🎯 Features

### For Farmers
- ✅ Start delivery tracking with driver details
- ✅ Real-time truck location updates (4-second polling)
- ✅ Monitor active deliveries dashboard
- ✅ Track distance traveled and ETA
- ✅ View delivery route on map
- ✅ Mark delivery as complete

### For Buyers  
- ✅ View live truck location on map
- ✅ See estimated arrival time
- ✅ Track delivery progress (%)
- ✅ Contact driver directly
- ✅ View truck details (vehicle type, plate, driver)

### System Features
- 📍 Real-time GPS location tracking
- 🗺️ Google Maps integration with directions
- 📊 Progress tracking and ETA calculation
- 📱 Mobile responsive design
- 🔄 Auto-refresh every 30 seconds
- 💾 Location history storage (last 20 points)
- 📈 Distance calculation using Haversine formula

---

## 📊 Database Schema

### Order Model Enhancements

```javascript
{
  // Existing fields...
  
  // Vehicle/Truck Details
  truck: {
    licensePlate: String,              // Vehicle license plate
    driverId: ObjectId,                // Reference to driver user
    driverName: String,                // Driver's name
    driverPhone: String,               // Driver's contact
    vehicleType: String,               // 'motorcycle' | 'bike' | 'auto' | 'truck' | 'van'
    isTracking: Boolean,               // Is currently tracking
  },

  // Real-Time Location
  vehicleLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date,                   // Last update time
  },

  // Location History
  locationHistory: [{
    lat: Number,
    lng: Number,
    timestamp: Date,
    speedKmh: Number,                  // Optional speed data
  }],

  // Tracking Times
  trackingStartedAt: Date,             // When delivery started
  trackingEndedAt: Date,               // When delivery completed
  estimatedArrival: Date,              // Calculated ETA
  actualArrival: Date,                 // Actual arrival time

  // Distance Tracking
  distanceTraveled: Number,            // km traveled
  totalDistance: Number,               // km from farm to buyer

  // Delivery Proof
  deliveryProof: {
    photoUrl: String,
    signature: String,
    timestamp: Date,
  },
}
```

---

## 🔌 API Endpoints

### 1. Start Delivery Tracking
```http
POST /api/tracking/start/:orderId
Authorization: Bearer {token}
Content-Type: application/json

{
  "driverName": "Rajesh Kumar",
  "driverPhone": "9876543210",
  "vehicleType": "bike",
  "licensePlate": "DL-01-AB-1234"
}

Response:
{
  "message": "Delivery tracking started",
  "order": { /* populated order */ }
}
```

**Status Codes:**
- `200` - Tracking started successfully
- `400` - Invalid data or order not in correct status
- `403` - Not authorized (not the farmer)
- `404` - Order not found

### 2. Update Truck Location (Real-Time)
```http
PATCH /api/tracking/:orderId/location
Authorization: Bearer {token}
Content-Type: application/json

{
  "lat": 28.6139,
  "lng": 77.2090,
  "speedKmh": 45
}

Response:
{
  "message": "Location updated",
  "currentLocation": { "lat": 28.6139, "lng": 77.2090, "timestamp": "2024-01-01T12:00:00Z" },
  "distanceTraveled": 5.2,
  "status": "out_for_delivery"
}
```

### 3. Get Live Tracking Data
```http
GET /api/tracking/:orderId/live
Authorization: Bearer {token}

Response:
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
  "lastUpdated": "2024-01-01T12:00:45Z",
  "locationHistory": [
    { "lat": 28.5994, "lng": 77.1997, "timestamp": "2024-01-01T12:00:00Z", "speedKmh": 0 },
    /* ... last 20 points ... */
  ]
}
```

### 4. Complete Delivery
```http
POST /api/tracking/:orderId/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "photoUrl": "https://...",
  "signature": "base64...",
  "notes": "Delivery completed successfully"
}

Response:
{
  "message": "Delivery completed successfully",
  "order": { /* populated order */ },
  "deliveryTime": {
    "started": "2024-01-01T12:00:00Z",
    "ended": "2024-01-01T12:30:00Z",
    "durationMinutes": 30
  },
  "distanceTraveled": 12.4
}
```

### 5. Get Active Deliveries (Farmer)
```http
GET /api/tracking/farmer/active
Authorization: Bearer {token}

Response:
{
  "count": 3,
  "orders": [
    {
      "orderId": "order123",
      "status": "out_for_delivery",
      "buyerName": "Priya Singh",
      "buyerPhone": "9876543211",
      "productName": "Tomatoes",
      "quantity": 5,
      "truck": { /* truck details */ },
      "currentLocation": { "lat": 28.6139, "lng": 77.2090 },
      "totalDistance": 15.5,
      "distanceTraveled": 8.2,
      "trackingStartedAt": "2024-01-01T12:00:00Z",
      "estimatedArrival": "2024-01-01T12:30:00Z"
    },
    /* ... more orders ... */
  ]
}
```

### 6. Get Tracking History
```http
GET /api/tracking/:orderId/history
Authorization: Bearer {token}

Response:
{
  "orderId": "order123",
  "totalLocations": 45,
  "locationHistory": [
    {
      "lat": 28.5994,
      "lng": 77.1997,
      "timestamp": "2024-01-01T12:00:00Z",
      "speedKmh": 0
    },
    /* ... 44 more points ... */
  ],
  "trackingStartedAt": "2024-01-01T12:00:00Z",
  "trackingEndedAt": "2024-01-01T12:30:00Z",
  "totalDistance": 15.5,
  "distanceTraveled": 15.4
}
```

---

## 🎨 Frontend Components

### 1. StartDeliveryTracking.tsx
**Path:** `src/pages/StartDeliveryTracking.tsx`

Form for farmers to enter driver and truck details before starting tracking.

**Props:**
- Route params: `orderId`

**Features:**
- Driver name input
- Phone number validation
- Vehicle type selector
- License plate input
- Loading state
- Error handling
- Success redirect to live tracking

**Usage:**
```typescript
// Route: /start-tracking/:orderId
<StartDeliveryTracking />
```

### 2. LiveTruckTracker.tsx
**Path:** `src/pages/LiveTruckTracker.tsx`

Full-screen live tracking map with real-time truck location updates.

**Features:**
- 3 markers (farm 🔴, truck 🟡, buyer 🔵)
- Real-time location polling (4 seconds)
- Route visualization with directions
- Progress bar with distance/ETA
- Truck details panel
- 500m service radius circle
- 4-second auto-refresh for farmers

**Usage:**
```typescript
// Route: /tracking/:orderId
<LiveTruckTracker />
```

### 3. FarmerDeliveriesDashboard.tsx
**Path:** `src/pages/FarmerDeliveriesDashboard.tsx`

Dashboard showing all active deliveries for farmer.

**Features:**
- Grid of active deliveries
- Progress bars
- Driver info
- Quick action buttons
- Auto-refresh toggle
- Manual refresh button
- Empty state handling

**Usage:**
```typescript
// Route: /farmer/deliveries
<FarmerDeliveriesDashboard />
```

---

## 🚀 Usage Workflow

### Farmer Workflow
```
1. Accept order → Order status: "pending"
2. Click "Start Delivery" → Route to StartDeliveryTracking
3. Enter driver & truck details → Click "Start Tracking"
4. Redirected to LiveTruckTracker with real-time map
5. System automatically updates location every 4 seconds
6. Farmer can see all active deliveries on dashboard
7. After delivery → Click "Complete" to end tracking
```

### Buyer Workflow
```
1. Place order → Farmer receives order
2. Farmer starts delivery tracking
3. Buyer receives notification with tracking link
4. Buyer views live truck location on map
5. Can see ETA and progress
6. Farmer marks delivery complete
7. Order status changes to "delivered"
```

---

## 📱 Real-Time Updates

### Location Update Interval
```
Frontend Polling: 4 seconds (POLL_INTERVAL_MS = 4000)
Backend Auto-Update: On each location patch
Dashboard Refresh: 30 seconds (auto-refresh toggle)
```

### Data Flow
```
Truck Driver App (Mobile)
    ↓ (PATCH /api/tracking/:orderId/location)
Backend Server (Node.js/Express)
    ↓ (Save to MongoDB)
Database (MongoDB)
    ↓ (GET /api/tracking/:orderId/live)
Farmer/Buyer Frontend
    ↓ (Poll every 4 seconds)
Update Map with new location
```

---

## 🔒 Authorization

### Route Protection
```javascript
// Only farmers can:
- POST /api/tracking/start/:orderId - Start tracking
- PATCH /api/tracking/:orderId/location - Update location
- POST /api/tracking/:orderId/complete - Complete delivery
- GET /api/tracking/farmer/active - View active deliveries

// Buyers can:
- GET /api/tracking/:orderId/live - View live tracking
- GET /api/tracking/:orderId/history - View tracking history

// Both (with proper authorization):
- Verify order ownership before accessing
```

---

## 📊 Example: Complete Tracking Flow

### 1. Farmer Starts Delivery
```bash
curl -X POST http://localhost:5000/api/tracking/start/order123 \
  -H "Authorization: Bearer farmer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "driverName": "Rajesh Kumar",
    "driverPhone": "9876543210",
    "vehicleType": "bike",
    "licensePlate": "DL-01-AB-1234"
  }'
```

### 2. Location Updates (Every 4 Seconds)
```bash
# Update 1 - Left farm
curl -X PATCH http://localhost:5000/api/tracking/order123/location \
  -H "Authorization: Bearer farmer_token" \
  -H "Content-Type: application/json" \
  -d '{ "lat": 28.5995, "lng": 77.2000, "speedKmh": 25 }'

# Update 2 - In traffic
curl -X PATCH http://localhost:5000/api/tracking/order123/location \
  -H "Authorization: Bearer farmer_token" \
  -H "Content-Type: application/json" \
  -d '{ "lat": 28.6050, "lng": 77.2100, "speedKmh": 15 }'

# Update 3 - Near destination
curl -X PATCH http://localhost:5000/api/tracking/order123/location \
  -H "Authorization: Bearer farmer_token" \
  -H "Content-Type: application/json" \
  -d '{ "lat": 28.6300, "lng": 77.2200, "speedKmh": 5 }'
```

### 3. Buyer Views Live Tracking
```bash
curl http://localhost:5000/api/tracking/order123/live \
  -H "Authorization: Bearer buyer_token"
```

### 4. Farmer Completes Delivery
```bash
curl -X POST http://localhost:5000/api/tracking/order123/complete \
  -H "Authorization: Bearer farmer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://...",
    "signature": "base64_signature",
    "notes": "Delivered successfully"
  }'
```

---

## 🐛 Debugging

### Check Active Deliveries
```javascript
// In browser console
fetch('http://localhost:5000/api/tracking/farmer/active', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => console.log(data))
```

### View Location History
```javascript
fetch('http://localhost:5000/api/tracking/ORDER_ID/history', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => console.log('Location history:', data.locationHistory))
```

### Verify Truck Status
```javascript
fetch('http://localhost:5000/api/tracking/ORDER_ID/live', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(data => {
  console.log('Status:', data.status)
  console.log('Is Tracking:', data.truck?.isTracking)
  console.log('Current Location:', data.currentLocation)
  console.log('Distance Traveled:', data.distanceTraveled)
})
```

---

## ⚙️ Configuration

### Google Maps API Requirements
- Maps JavaScript API ✅
- Directions API ✅
- Distance Matrix API ✅
- Geocoding API ✅

### Environment Variables
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
VITE_API_URL=http://localhost:5000
```

### Performance
```
- Location History: Last 20 points stored
- Polling Interval: 4 seconds (adjustable)
- Distance Calculation: Haversine formula
- Progress Display: Updates every poll cycle
- Dashboard Refresh: 30 seconds auto-refresh
```

---

## 📈 Metrics & Analytics

Track these metrics for monitoring:
- Average delivery time
- Average distance traveled
- Location update frequency
- ETA accuracy
- Delivery completion rate
- Active tracking duration

---

## 🔄 Integration with Order System

### Order Status Flow
```
pending → accepted → shipped → out_for_delivery → delivered
                           ↑            ↑
                    Tracking starts  Auto-transition
                                     on location update
```

### Related Endpoints
- Create Order: `POST /api/orders/create`
- Update Status: `PUT /api/orders/:id`
- Get Order: `GET /api/orders/:id`
- Tracking: `GET/PATCH /api/tracking/*`

---

## 🎓 Testing

### Test Scenarios
1. **Start Tracking** - Enter driver details, verify truck status changes
2. **Location Updates** - Send location patches, verify map updates
3. **Progress Calculation** - Check distance and progress percentage
4. **ETA Estimation** - Verify ETA calculation accuracy
5. **Active Deliveries** - List all deliveries, filter by status
6. **Complete Delivery** - End tracking, verify status change

### Manual Testing
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Test API calls
bash test_tracking.sh
```

---

## 🚀 Deployment Checklist

- [ ] Google Maps API key configured
- [ ] Backend routes added to server
- [ ] Truck tracking controller deployed
- [ ] Frontend components in correct routes
- [ ] Database indexes for tracking queries
- [ ] Error handling tested
- [ ] Location polling interval set
- [ ] Authorization verified
- [ ] Mobile responsiveness tested
- [ ] Real-time updates working

---

## 📝 Notes

- Location data is stored every 4 seconds max
- Only last 20 location points displayed for performance
- Distances calculated using Haversine formula
- Auto-transition from "shipped" to "out_for_delivery" on location update
- All timestamps in UTC
- Phone numbers validated as 10 digits

---

**Version:** 1.0
**Last Updated:** April 16, 2026
**Status:** ✅ Production Ready
