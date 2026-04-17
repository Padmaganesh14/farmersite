# 🔧 Order Tracking System - Troubleshooting & FAQ

---

## 🚨 Common Errors & Solutions

### 1. "Not authorized, no token"

**Error Response**:
```json
{
  "message": "Not authorized, no token",
  "statusCode": 401
}
```

**Causes**:
- No Authorization header provided
- Token expired
- Token missing from header

**Solutions**:

```bash
# ✅ Correct:
curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# ❌ Wrong:
curl http://localhost:5000/api/orders/my
curl http://localhost:5000/api/orders/my \
  -H "Authorization: eyJhbGciOiJIUzI1NiIs..."  # Missing "Bearer"
```

**Check Token**:
```typescript
// In React component
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token value:', token);
```

**Get New Token**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
# Copy token from response
```

---

### 2. "Not authorized to update this order status"

**Error Response**:
```json
{
  "message": "Not authorized to update this order status",
  "statusCode": 403
}
```

**Causes**:
- Buyer trying to update (only farmers can)
- Farmer doesn't own the product
- Order doesn't exist
- Wrong authorization check

**Solutions**:

```javascript
// Check your role
const user = context.user;
console.log('Your role:', user?.role);  // Should be 'farmer'

// Verify you're the farmer for this product
// Check order.product.farmer === your user ID
```

**Authorization Matrix**:
| Action | Buyer | Farmer |
|--------|-------|--------|
| Create order | ✅ | ❌ |
| Update status | ❌ | ✅ |
| Update location | ❌ | ✅ |
| View own orders | ✅ | ✅ |

---

### 3. "Invalid status transition"

**Error Response**:
```json
{
  "message": "Invalid status transition from pending to shipped",
  "statusCode": 400
}
```

**Causes**:
- Trying to skip statuses
- Wrong transition order
- Already in final state

**Valid Transitions**:
```
pending        → accepted, cancelled
accepted       → shipped, cancelled
shipped        → out_for_delivery, delivered
out_for_delivery → delivered
delivered      → (no transitions)
cancelled      → (no transitions)
```

**Solutions**:

```javascript
// Always follow the flow:
// 1. pending → accepted
await updateStatus(orderId, 'accepted');

// 2. accepted → shipped
await updateStatus(orderId, 'shipped');

// 3. Update location to auto-transition to out_for_delivery
await updateLocation(orderId, lat, lng);

// 4. out_for_delivery → delivered
await updateStatus(orderId, 'delivered');
```

**Exception**: Location update auto-transitions `shipped` → `out_for_delivery`

---

### 4. "Product not found"

**Error Response**:
```json
{
  "message": "Product not found",
  "statusCode": 404
}
```

**Causes**:
- Product ID is invalid/wrong
- Product was deleted
- Product ID is corrupted

**Solutions**:

```bash
# Verify product exists
curl http://localhost:5000/api/products/:productId

# Check product ID format
# Should be 24-character MongoDB ObjectId
productId.length === 24  // true

# Get valid product ID from marketplace
curl http://localhost:5000/api/products/all
```

---

### 5. "Order not found"

**Error Response**:
```json
{
  "message": "Order not found",
  "statusCode": 404
}
```

**Causes**:
- Order ID doesn't exist
- Order was deleted
- Wrong order ID

**Solutions**:

```javascript
// Get correct order ID
const orders = await axios.get('http://localhost:5000/api/orders/my', {
  headers: { 'Authorization': `Bearer ${token}` }
});

console.log('Valid order IDs:', orders.data.map(o => o._id));

// Verify order ID format
const orderId = '507f1f77bcf86cd799439012';
console.log('Valid format:', orderId.length === 24);
```

---

### 6. "Quantity must be greater than 0"

**Error Response**:
```json
{
  "message": "Quantity must be greater than 0",
  "statusCode": 400
}
```

**Causes**:
- Quantity is 0 or negative
- Quantity is not a number
- Quantity is missing

**Solutions**:

```javascript
// ✅ Correct:
const order = {
  productId: '507f...',
  quantity: 5,  // positive integer
  buyerLocation: { lat: 11.01, lng: 76.95 }
};

// ❌ Wrong:
quantity: 0      // ✗ Invalid
quantity: -5     // ✗ Invalid
quantity: "5"    // Might work if parsed
quantity: 1.5    // Should be integer
```

---

### 7. "Invalid coordinates"

**Error Response**:
```json
{
  "message": "Invalid coordinates",
  "statusCode": 400
}
```

**Causes**:
- Latitude/Longitude missing
- Not valid numbers
- Out of valid range

**Solutions**:

```javascript
// Valid coordinates:
// Latitude: -90 to 90
// Longitude: -180 to 180

// ✅ Correct:
const location = {
  lat: 11.0168,   // 11.0168°N (Coimbatore)
  lng: 76.9558    // 76.9558°E
};

// ❌ Wrong:
lat: 91         // ✗ Out of range
lng: 181        // ✗ Out of range
lat: "11.01"    // ✗ Must be number
lat: undefined  // ✗ Must be provided
```

---

### 8. CORS Error

**Error in Browser**:
```
Access to XMLHttpRequest at 'http://localhost:5000/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causes**:
- Backend CORS not configured
- Wrong API URL
- Frontend and backend on different domains

**Solutions**:

**Backend (server.js)**:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true
}));
```

**Check your API URL**:
```typescript
// In React component
const API_BASE = 'http://localhost:5000';
const token = localStorage.getItem('token');

console.log('API URL:', API_BASE);
console.log('Has token:', !!token);
```

---

### 9. "Cannot read property '_id' of undefined"

**Error in Console**:
```
TypeError: Cannot read property '_id' of undefined
```

**Causes**:
- Order object is null/undefined
- API response format wrong
- Data not loaded yet

**Solutions**:

```typescript
// ✅ Always check before access:
if (!order || !order._id) {
  console.error('Order data invalid');
  return <Loading />;
}

// ✅ In components:
{order && (
  <div>
    Order ID: {order._id}
  </div>
)}

// ✅ In API calls:
const response = await axios.get('/api/orders/my');
console.log('Response:', response.data);  // Log to verify structure
if (!Array.isArray(response.data)) {
  console.error('Expected array, got:', typeof response.data);
}
```

---

### 10. "Cannot update delivered order"

**Error Response**:
```json
{
  "message": "Cannot update delivered order",
  "statusCode": 400
}
```

**Causes**:
- Order already delivered
- Order already cancelled
- Trying to modify final state

**Solutions**:

```javascript
// Check order status before attempting update
const order = await getOrder(orderId);

if (['delivered', 'cancelled'].includes(order.status)) {
  console.log('Order is in final state, cannot update');
  return;
}

// Only update if not in final state
if (!['delivered', 'cancelled'].includes(order.status)) {
  await updateStatus(orderId, nextStatus);
}
```

---

## ❓ Frequently Asked Questions

### Q1: How do I get the JWT token?

**A**: Login to get token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

Then store and use it:
```typescript
localStorage.setItem('token', response.data.token);
```

---

### Q2: How do I know if I'm a farmer or buyer?

**A**: Check your user role:

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user } = useContext(AuthContext);
  
  console.log('Your role:', user?.role);  // 'farmer' or 'buyer'
  
  if (user?.role === 'farmer') {
    return <FarmerView />;
  } else if (user?.role === 'buyer') {
    return <BuyerView />;
  }
}
```

---

### Q3: Why can't I create an order?

**A**: Only buyers can create orders. Check your role:

```typescript
// If role is 'farmer':
// ❌ You cannot create orders (farmers don't buy)
// ✅ You can accept/update orders for your products

// If role is 'buyer':
// ✅ You can create orders
// ❌ You cannot update order status
```

---

### Q4: How often should vehicle location be updated?

**A**: Recommended: Every 30-60 seconds during delivery

```typescript
// Example: Update every 30 seconds
setInterval(async () => {
  const { coords } = await getCurrentPosition();
  await updateLocation(orderId, coords.latitude, coords.longitude);
}, 30000);  // 30 seconds
```

---

### Q5: Can I cancel a delivered order?

**A**: No. Once delivered, order is final:

```javascript
// Valid cancellations:
pending   → ✅ Can cancel
accepted  → ✅ Can cancel (rarely)

// ❌ Cannot cancel:
shipped           → ❌
out_for_delivery  → ❌
delivered         → ❌
```

---

### Q6: What if I update location while status is pending?

**A**: Location is ignored until status is `shipped`:

```javascript
// Only affects status if currently 'shipped':
if (status === 'shipped') {
  // Auto-transition to out_for_delivery
  status = 'out_for_delivery';
}
```

---

### Q7: How do I track an order in real-time?

**A**: Use the Tracking page:

```typescript
import { useParams } from 'react-router-dom';
import TrackingPage from '@/pages/TrackingPage';

// Navigate to:
// /order-tracking/:orderId

// Updates every 4 seconds automatically
```

---

### Q8: What happens if I try invalid coordinates?

**A**: API rejects the request:

```bash
# ❌ Invalid latitude (> 90):
curl -X PATCH .../location \
  -d '{"lat": 95, "lng": 76.95}'
# → 400 Bad Request

# ✅ Valid coordinates:
curl -X PATCH .../location \
  -d '{"lat": 11.01, "lng": 76.95}'
# → 200 OK
```

---

### Q9: Why is expected delivery always 3 days?

**A**: System automatically sets it:

```javascript
// In backend:
expectedDelivery = new Date();
expectedDelivery.setDate(expectedDelivery.getDate() + 3);
```

Can be customized if needed in controller.

---

### Q10: Can buyers update order location?

**A**: No, only farmers can:

```typescript
// ❌ Buyer:
await updateLocation(orderId, lat, lng);
// → 403 Forbidden: "Not authorized"

// ✅ Farmer:
await updateLocation(orderId, lat, lng);
// → 200 OK
```

---

## 🔍 Debugging Checklist

Before submitting a bug report, verify:

- [ ] Token is valid (not expired)
- [ ] Using correct API URL (http://localhost:5000)
- [ ] Your role matches the operation (farmer vs buyer)
- [ ] Order exists (not deleted)
- [ ] Status transition is valid
- [ ] Coordinates are in valid range
- [ ] Quantity is positive integer
- [ ] Network requests show in DevTools
- [ ] Console has no JavaScript errors
- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] No other services blocking port 5000

---

## 📱 Browser DevTools Debugging

### Network Tab

```
1. Open DevTools (F12)
2. Go to Network tab
3. Make API request
4. Click request in list
5. View:
   - URL ✓
   - Status code ✓
   - Request headers (Authorization) ✓
   - Response body ✓
```

### Console Tab

```
1. Open DevTools (F12)
2. Go to Console tab
3. Log data:
   console.log('Order:', order);
   console.log('Token:', token);
   console.log('User:', user);
4. Check for errors
```

### Application/Storage Tab

```
1. Open DevTools (F12)
2. Application → Local Storage
3. Check 'token' is saved
4. Verify token value is present
5. Check AuthContext state
```

---

## 🆘 Still Not Working?

### Gather Debug Info

```typescript
// Create diagnostic data
const diagnostic = {
  userRole: user?.role,
  hasToken: !!localStorage.getItem('token'),
  apiUrl: 'http://localhost:5000',
  frontendUrl: window.location.origin,
  orderStatus: order?.status,
  userId: user?._id,
  timestamp: new Date().toISOString(),
};

console.log('Diagnostic:', diagnostic);
```

### Check Backend Logs

```bash
# Backend console should show:
✅ Order created: 507f...
✅ Status: pending → accepted
✅ Location updated

# If no logs:
1. Restart backend
2. Check request is actually reaching backend
3. Check middleware is running
```

### Verify Database

```bash
# Check MongoDB directly
db.orders.findOne({_id: ObjectId("507f1f77bcf86cd799439012")})

# Should return order with all fields
# If empty → Order not in database
```

---

## 📞 Getting Help

**Include in bug report**:
1. Error message (exact)
2. What you were trying to do
3. Your role (farmer/buyer)
4. Order ID if applicable
5. Console logs/screenshots
6. Steps to reproduce
7. Diagnostic data (from above)

**Try these first**:
1. Refresh page (Ctrl+Shift+R for full refresh)
2. Restart backend server
3. Check token in localStorage
4. Verify role is correct
5. Check network requests in DevTools
6. Review this troubleshooting guide

---

## ✅ Common Success Scenarios

### Buyer Creates Order Successfully

```javascript
console.log('✅ Order created');
console.log('✅ ID:', order._id);
console.log('✅ Status:', order.status);  // should be 'pending'
console.log('✅ Expected delivery:', order.expectedDelivery);
```

### Farmer Updates Status Successfully

```javascript
console.log('✅ Status updated');
console.log('✅ New status:', order.status);
console.log('✅ Updated at:', order.updatedAt);
```

### Location Update Successful

```javascript
console.log('✅ Location updated');
console.log('✅ New coords:', order.vehicleLocation);
console.log('✅ Auto-transitioned:', order.status);  // should be 'out_for_delivery'
```

---

**When in doubt, check the console logs and network requests!** 🔍
