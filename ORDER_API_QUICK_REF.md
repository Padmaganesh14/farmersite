# 📱 Order Tracking - Quick API Reference

## 🚀 Quick Start

### Setup
```bash
# Backend already has all endpoints
# Just start the server:
cd backend
npm run dev

# Frontend components are ready:
# Add to your routing
```

---

## 📡 All API Endpoints at a Glance

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/orders/create` | ✅ | buyer | Create new order |
| GET | `/api/orders/my` | ✅ | both | Get all orders |
| GET | `/api/orders/:id` | ✅ | both | Get single order |
| PUT | `/api/orders/:id` | ✅ | farmer | Update order status |
| PATCH | `/api/orders/:id/location` | ✅ | farmer | Update vehicle location |
| GET | `/api/orders/:id/tracking` | ✅ | both | Get tracking details |

---

## 💻 Code Snippets

### 1️⃣ Create Order (Buyer)

```javascript
// Create order for a product
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',
    quantity: 5,
    buyerLocation: { lat: 11.0168, lng: 76.9558 }
  })
});

const order = await response.json();
console.log('✅ Order created:', order);
```

### 2️⃣ Fetch My Orders (Farmer/Buyer)

```javascript
// Get all orders (farmer: their products' orders, buyer: their orders)
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/orders/my', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const orders = await response.json();
console.log('✅ Orders:', orders);
```

### 3️⃣ Update Order Status (Farmer)

```javascript
// Move order to next status
const token = localStorage.getItem('token');
const orderId = '507f1f77bcf86cd799439012';

const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'accepted',  // next status
    notes: 'Order accepted and being prepared'
  })
});

const updatedOrder = await response.json();
console.log('✅ Status updated:', updatedOrder);
```

### 4️⃣ Update Vehicle Location (Farmer)

```javascript
// Update vehicle location during delivery
const token = localStorage.getItem('token');
const orderId = '507f1f77bcf86cd799439012';

const response = await fetch(`http://localhost:5000/api/orders/${orderId}/location`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lat: 11.0350,
    lng: 76.9700
  })
});

const result = await response.json();
console.log('✅ Location updated:', result);
```

### 5️⃣ Get Tracking Details

```javascript
// Get full tracking info (locations, status, etc)
const token = localStorage.getItem('token');
const orderId = '507f1f77bcf86cd799439012';

const response = await fetch(`http://localhost:5000/api/orders/${orderId}/tracking`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const tracking = await response.json();
console.log('✅ Tracking:', tracking);
```

---

## 🎨 React Component Usage

### Use OrderTracker in Your Component

```tsx
import OrderTracker from '@/components/OrderTracker';

export function MyOrdersList() {
  const [orders, setOrders] = useState([]);

  return (
    <div>
      {orders.map(order => (
        <OrderTracker
          key={order._id}
          order={order}
          isFarmer={user?.role === 'farmer'}
          showUpdateButton={user?.role === 'farmer'}
          onUpdateStatus={() => fetchOrders()} // Refresh after update
        />
      ))}
    </div>
  );
}
```

### Use OrdersPage in Your Routing

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrdersPage from '@/pages/OrdersPage';
import TrackingPage from '@/pages/TrackingPage';

export function App() {
  return (
    <Routes>
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/order-tracking/:orderId" element={<TrackingPage />} />
    </Routes>
  );
}
```

---

## 📊 Order Status Flow

```
BUYER CREATES
     ↓
  PENDING ← Farmer can cancel from here
     ↓
Farmer accepts
     ↓
 ACCEPTED ← Farmer can cancel from here
     ↓
Farmer ships
     ↓
  SHIPPED
     ↓
Location update
     ↓
OUT_FOR_DELIVERY
     ↓
Delivered
     ↓
DELIVERED ← Final state

BUYER CANCELS (only if pending):
  PENDING → CANCELLED
```

---

## ✅ Valid Status Transitions

```javascript
const validTransitions = {
  'pending':          ['accepted', 'cancelled'],
  'accepted':         ['shipped', 'cancelled'],
  'shipped':          ['out_for_delivery', 'delivered'],
  'out_for_delivery': ['delivered'],
  'delivered':        [],
  'cancelled':        []
};
```

---

## 🧪 Testing with cURL

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f...",
    "quantity": 5,
    "buyerLocation": {"lat": 11.0168, "lng": 76.9558}
  }'
```

### Get Orders
```bash
curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Status
```bash
curl -X PUT http://localhost:5000/api/orders/507f... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

### Update Location
```bash
curl -X PATCH http://localhost:5000/api/orders/507f.../location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 11.05, "lng": 76.95}'
```

---

## 🔍 Request/Response Examples

### POST /api/orders/create

**Request**:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 5,
  "buyerLocation": {
    "lat": 11.0168,
    "lng": 76.9558
  }
}
```

**Response (201)**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "buyer": {
    "_id": "507f...",
    "name": "John Buyer",
    "email": "john@example.com"
  },
  "product": {
    "_id": "507f...",
    "cropName": "Tomato",
    "price": 50,
    "image": "/uploads/tomato.jpg"
  },
  "quantity": 5,
  "totalPrice": 250,
  "status": "pending",
  "expectedDelivery": "2024-04-19T10:30:00Z",
  "createdAt": "2024-04-16T10:30:00Z"
}
```

### GET /api/orders/my

**Response (200)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "buyer": { "name": "John Buyer", "email": "john@example.com" },
    "product": { "cropName": "Tomato", "price": 50 },
    "quantity": 5,
    "totalPrice": 250,
    "status": "shipped",
    "createdAt": "2024-04-16T10:30:00Z"
  }
]
```

### PUT /api/orders/:id

**Request**:
```json
{
  "status": "accepted",
  "notes": "Order confirmed"
}
```

**Response (200)**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "status": "accepted",
  "notes": "Order confirmed",
  "updatedAt": "2024-04-16T11:00:00Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "message": "Quantity must be greater than 0",
  "stack": "..."
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token",
  "stack": "..."
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to update this order status",
  "stack": "..."
}
```

### 404 Not Found
```json
{
  "message": "Order not found",
  "stack": "..."
}
```

---

## 🔐 Authorization Matrix

| Action | Buyer | Farmer | Anonymous |
|--------|-------|--------|-----------|
| Create order | ✅ | ❌ | ❌ |
| View own orders | ✅ | ✅ | ❌ |
| Update status | ❌ | ✅ | ❌ |
| Update location | ❌ | ✅ | ❌ |
| Cancel pending | ✅ | ❌ | ❌ |
| View tracking | ✅ | ✅ | ❌ |

---

## 🔑 JWT Token

Get token from login endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIs..."}
```

Use in headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🎯 Common Tasks

### Buyer: Place Order
1. Get product ID
2. POST /api/orders/create
3. Save returned order ID
4. Navigate to /orders to track

### Farmer: Accept & Ship Order
1. GET /api/orders/my
2. PUT /api/orders/:id (status: accepted)
3. PUT /api/orders/:id (status: shipped)
4. PATCH /api/orders/:id/location (update location)
5. PUT /api/orders/:id (status: out_for_delivery)
6. PUT /api/orders/:id (status: delivered)

### Buyer: Track Order
1. GET /api/orders/my
2. Click "Live Tracking" on order
3. See real-time vehicle location
4. View estimated arrival

---

## 📱 Frontend Components Status

| Component | Status | Location |
|-----------|--------|----------|
| OrderTracker | ✅ Complete | `src/components/OrderTracker.tsx` |
| OrdersPage | ✅ Complete | `src/pages/OrdersPage.tsx` |
| TrackingPage | ✅ Ready | `src/pages/TrackingPage.tsx` |
| OrderMap | ✅ Ready | `src/components/OrderMap.tsx` |

---

## 🚀 Deployment

### Backend
- All endpoints ready
- All middleware configured
- Error handling complete
- Database indexes set

### Frontend
- Components ready to use
- Responsive design included
- Error handling included
- Real-time updates supported

### What's Needed
- ✅ Database: MongoDB
- ✅ Server: Node.js + Express
- ✅ Frontend: React + Vite
- ✅ Auth: JWT
- ⭐ Optional: Google Maps API (for live tracking map)

---

**Everything is ready for production!** ✅
