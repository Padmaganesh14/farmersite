# 🧪 Order Tracking System - Testing Guide

## Prerequisites

✅ Backend server running on `http://localhost:5000`
✅ Frontend running on `http://localhost:5173` (Vite default)
✅ MongoDB connected
✅ At least 2 test users (1 buyer, 1 farmer with products)

---

## 📋 Test Accounts Setup

### 1. Create Farmer Test Account

**Endpoint**: POST `/api/auth/signup`

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajan Kumar",
    "email": "farmer@test.com",
    "password": "test1234",
    "role": "farmer"
  }'
```

**Save token as**: `FARMER_TOKEN`

### 2. Create Buyer Test Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "buyer@test.com",
    "password": "test1234",
    "role": "buyer"
  }'
```

**Save token as**: `BUYER_TOKEN`

### 3. Create Test Product (as Farmer)

**Endpoint**: POST `/api/products/add`

```bash
curl -X POST http://localhost:5000/api/products/add \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "cropName=Tomato" \
  -F "description=Fresh red tomatoes" \
  -F "price=50" \
  -F "quantity=100" \
  -F "image=@tomato.jpg" \
  -F "harvestDate=2024-04-20"
```

**Save product ID as**: `PRODUCT_ID`

---

## ✅ Test Case 1: Create Order

**Description**: Buyer creates an order for a product

### Steps:

```bash
# 1. Get product ID (from previous step)
PRODUCT_ID="507f1f77bcf86cd799439011"

# 2. Create order as buyer
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 5,
    "buyerLocation": {
      "lat": 11.0168,
      "lng": 76.9558
    }
  }'
```

### Expected Results:
- ✅ Status code: 201 Created
- ✅ Response has `_id` (save as `ORDER_ID`)
- ✅ Status is `pending`
- ✅ `expectedDelivery` is 3 days from now
- ✅ `totalPrice = product.price * quantity`

### Save:
```bash
ORDER_ID="507f1f77bcf86cd799439012"
```

---

## ✅ Test Case 2: View Orders (Buyer)

**Description**: Buyer sees their own orders

### Steps:

```bash
curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### Expected Results:
- ✅ Status code: 200 OK
- ✅ Response is array
- ✅ Contains the order created in Test Case 1
- ✅ Only shows orders created by this buyer

---

## ✅ Test Case 3: View Orders (Farmer)

**Description**: Farmer sees orders for their products

### Steps:

```bash
curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

### Expected Results:
- ✅ Status code: 200 OK
- ✅ Response is array
- ✅ Contains the order created by buyer (for their product)
- ✅ Only shows orders for their products

---

## ✅ Test Case 4: Get Single Order

**Description**: Anyone can view order they're involved in

### Buyer viewing their order:

```bash
curl http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### Farmer viewing order for their product:

```bash
curl http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

### Expected Results:
- ✅ Status code: 200 OK
- ✅ Returns full order details
- ✅ Includes populated buyer and product data

### Test authorization (should fail):

```bash
# Create another buyer who didn't create order
curl http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $OTHER_BUYER_TOKEN"
```

**Expected**: Status 403 Forbidden (not authorized)

---

## ✅ Test Case 5: Update Order Status (Valid)

**Description**: Farmer progresses order through valid statuses

### Step 1: pending → accepted

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "notes": "Order accepted and being prepared"
  }'
```

**Expected**:
- ✅ Status code: 200 OK
- ✅ Response status is `accepted`

### Step 2: accepted → shipped

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

**Expected**:
- ✅ Status code: 200 OK
- ✅ Response status is `shipped`

### Step 3: shipped → out_for_delivery (via location update)

```bash
curl -X PATCH http://localhost:5000/api/orders/$ORDER_ID/location \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 11.0350,
    "lng": 76.9700
  }'
```

**Expected**:
- ✅ Status code: 200 OK
- ✅ Status auto-changed to `out_for_delivery`
- ✅ Vehicle location updated

### Step 4: out_for_delivery → delivered

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

**Expected**:
- ✅ Status code: 200 OK
- ✅ Response status is `delivered`
- ✅ `deliveredAt` is set

---

## ✅ Test Case 6: Invalid Status Transition

**Description**: System prevents invalid status changes

### Try: delivered → pending (should fail)

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'
```

**Expected**:
- ✅ Status code: 400 Bad Request
- ✅ Error message mentions invalid transition

### Try: pending → shipped (skip accepted, should fail)

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID2 \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

**Expected**:
- ✅ Status code: 400 Bad Request
- ✅ Error message about invalid transition

---

## ✅ Test Case 7: Authorization Check

**Description**: Only farmers can update status, only own products

### Buyer trying to update (should fail):

```bash
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

**Expected**:
- ✅ Status code: 403 Forbidden
- ✅ Error message about authorization

### Different farmer (different product, should fail):

```bash
# Create order for farmer A's product, try update as farmer B
curl -X PUT http://localhost:5000/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $OTHER_FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

**Expected**:
- ✅ Status code: 403 Forbidden

---

## ✅ Test Case 8: Location Updates

**Description**: Vehicle location updates during delivery

### Update location 1:

```bash
curl -X PATCH http://localhost:5000/api/orders/$ORDER_ID/location \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 11.0200, "lng": 76.9600}'
```

### Update location 2:

```bash
curl -X PATCH http://localhost:5000/api/orders/$ORDER_ID/location \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 11.0250, "lng": 76.9650}'
```

### Get tracking details:

```bash
curl http://localhost:5000/api/orders/$ORDER_ID/tracking \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

**Expected**:
- ✅ Status code: 200 OK
- ✅ `vehicleLocation` matches last update
- ✅ `farmerLocation` and `buyerLocation` are present
- ✅ All coordinates are valid

---

## ✅ Test Case 9: Frontend - Create Order

**Description**: Test create order flow in React UI

### Steps:

1. Open browser to `http://localhost:5173`
2. Login as buyer
3. Navigate to Marketplace
4. Find a product
5. Click "Buy" or "Add to Order"
6. Enter quantity and delivery location
7. Submit

### Expected:
- ✅ Order created successfully
- ✅ Redirects to Orders page
- ✅ New order appears in list with `pending` status
- ✅ Correct product, quantity, and price shown

---

## ✅ Test Case 10: Frontend - View Orders Dashboard

**Description**: Test orders listing page

### As Buyer:

1. Login as buyer
2. Navigate to `/orders`

**Expected**:
- ✅ Page loads without errors
- ✅ Shows "My Orders"
- ✅ Lists all buyer's orders
- ✅ Status filter tabs work
- ✅ Can click on order to view details

### As Farmer:

1. Login as farmer
2. Navigate to `/orders`

**Expected**:
- ✅ Page loads without errors
- ✅ Shows "Orders Received"
- ✅ Lists orders for their products
- ✅ Each order shows action button
- ✅ Status filter tabs work

---

## ✅ Test Case 11: Frontend - Update Status

**Description**: Test farmer status update from UI

### Steps:

1. Login as farmer
2. Go to `/orders`
3. Find pending order
4. Click "Mark as Accepted" button
5. Wait for success/error message

### Expected:
- ✅ Button shows loading state
- ✅ Status updates successfully
- ✅ UI refreshes with new status
- ✅ Success message appears
- ✅ Can continue to next status

---

## ✅ Test Case 12: Frontend - Live Tracking

**Description**: Test live tracking page

### Steps:

1. Login as buyer or farmer
2. Go to `/orders`
3. Click order with `out_for_delivery` status
4. Click "Live Tracking" or "View on Map"
5. Page should show:
   - Google Map (if API key configured)
   - 3 markers: farmer location, vehicle, buyer
   - Route between locations
   - ETA

### Expected:
- ✅ Map loads
- ✅ Markers display correctly
- ✅ Real-time updates every 4 seconds
- ✅ Route visualizes correctly
- ✅ ETA calculates

---

## ✅ Test Case 13: Pagination & Filtering

**Description**: Test large order lists

### Setup:

```bash
# Create 15+ orders with different statuses
# Loop 15 times to create orders
```

### Test:

1. Navigate to `/orders`
2. Use status filter tabs
3. Click each status to filter

### Expected:
- ✅ Page responds quickly
- ✅ Correct orders shown for each filter
- ✅ Count displayed correctly
- ✅ No page lag even with many orders

---

## ✅ Test Case 14: Error Handling

**Description**: Test error scenarios

### No token (should fail):

```bash
curl http://localhost:5000/api/orders/my
```

**Expected**: 401 Unauthorized

### Invalid token:

```bash
curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer invalid_token"
```

**Expected**: 401 Unauthorized

### Non-existent order:

```bash
curl http://localhost:5000/api/orders/000000000000000000000000 \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

**Expected**: 404 Not Found

### Invalid quantity:

```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": -5,
    "buyerLocation": {"lat": 11.0168, "lng": 76.9558}
  }'
```

**Expected**: 400 Bad Request

---

## ✅ Test Case 15: Concurrent Operations

**Description**: Test multiple simultaneous operations

### Setup:

Open 2 browser windows:
- Window 1: Farmer logged in
- Window 2: Buyer logged in

### Steps:

1. Buyer creates order
2. Farmer accepts order (immediately)
3. Farmer updates location
4. Buyer views tracking simultaneously

### Expected:
- ✅ No conflicts
- ✅ All operations succeed
- ✅ Data consistent between views
- ✅ No race conditions

---

## 🎯 Performance Testing

### Test Order Creation Time

```bash
time curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "'$PRODUCT_ID'", "quantity": 5, ...}'
```

**Expected**: < 500ms

### Test List Orders (100 orders)

```bash
time curl http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

**Expected**: < 1000ms

### Test Location Update

```bash
time curl -X PATCH http://localhost:5000/api/orders/$ORDER_ID/location \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 11.05, "lng": 76.95}'
```

**Expected**: < 300ms

---

## 🔍 Debugging Tips

### Check Console Logs

Backend logs should show:
```
✅ Order created: 507f1f77bcf86cd799439012
✅ Order updated: 507f1f77bcf86cd799439012
✅ Status: pending → accepted
```

### Frontend Console

Should show:
```javascript
✅ Order created: [order object]
✅ Loaded 5 orders
✅ Status updated to accepted
```

### Check Database

```bash
# MongoDB CLI
db.orders.find({_id: ObjectId("507f1f77bcf86cd799439012")})
```

---

## 📝 Test Results Template

| Test Case | Status | Notes | Time |
|-----------|--------|-------|------|
| 1. Create Order | ✅ | Works | 0.3s |
| 2. Buyer View | ✅ | Works | 0.2s |
| 3. Farmer View | ✅ | Works | 0.2s |
| 4. Get Single | ✅ | Works | 0.1s |
| 5. Update Status | ✅ | Works | 0.4s |
| 6. Invalid Trans | ✅ | Blocked | 0.1s |
| 7. Auth Check | ✅ | Secured | 0.1s |
| 8. Location Update | ✅ | Works | 0.3s |
| 9. Create (UI) | ✅ | Works | 1.2s |
| 10. Dashboard | ✅ | Works | 0.8s |
| 11. Update (UI) | ✅ | Works | 1.5s |
| 12. Tracking (Map) | ✅ | Works | 2.0s |
| 13. Filtering | ✅ | Works | 0.3s |
| 14. Error Handling | ✅ | Works | 0.1s |
| 15. Concurrent | ✅ | Works | 2.0s |

---

## ✅ Production Readiness Checklist

- [ ] All 15 test cases passing
- [ ] No console errors
- [ ] Error messages are user-friendly
- [ ] Performance within targets
- [ ] Database queries optimized
- [ ] Authorization working properly
- [ ] No SQL injection vulnerabilities
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logging enabled
- [ ] Error tracking enabled
- [ ] Database backups configured
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Load testing passed

---

**When all tests pass, the system is ready for production!** ✅
