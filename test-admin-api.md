# Admin API Test Documentation

This document provides test cases for the admin API endpoints that have been implemented.

## Test Environment Setup

1. Start the development server: `npm run dev`
2. Ensure you have admin authentication (JWT token)
3. Use a tool like Postman, curl, or browser dev tools for testing

## Test Cases

### 1. Drivers API Tests

#### Test 1.1: Get All Drivers
```bash
GET /api/admin/drivers
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "drivers": [
      {
        "_id": "driver1",
        "name": "Ahmed Hassan",
        "phone": "+20 123 456 7890",
        "email": "ahmed.hassan@example.com",
        "licenseNumber": "DL-2024-001",
        "vehicleInfo": {
          "type": "Motorcycle",
          "model": "Honda",
          "plateNumber": "ABC123",
          "color": "Red"
        },
        "status": "available",
        "isActive": true,
        "rating": 4.8
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalDrivers": 4,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Test 1.2: Get Available Drivers Only
```bash
GET /api/admin/drivers?status=available
```

**Expected Response:** Only drivers with status "available"

#### Test 1.3: Search Drivers
```bash
GET /api/admin/drivers?search=Ahmed
```

**Expected Response:** Only drivers with "Ahmed" in name, email, or phone

#### Test 1.4: Pagination
```bash
GET /api/admin/drivers?page=1&limit=2
```

**Expected Response:** Only 2 drivers with pagination info

### 2. Orders API Tests

#### Test 2.1: Get All Orders
```bash
GET /api/admin/orders
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order1",
        "user": {
          "userId": "user1",
          "userName": "John Doe",
          "phoneNumber": "+1234567890",
          "email": "john@example.com"
        },
        "items": [...],
        "address": {...},
        "status": "pending",
        "courier": null,
        "statusHistory": [...],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalOrders": 3,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Test 2.2: Filter Orders by Status
```bash
GET /api/admin/orders?status=pending
```

**Expected Response:** Only orders with status "pending"

#### Test 2.3: Search Orders
```bash
GET /api/admin/orders?search=John
```

**Expected Response:** Only orders with "John" in user name, phone, or city

### 3. Analytics API Tests

#### Test 3.1: Dashboard Analytics
```bash
GET /api/admin/analytics/dashboard
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "todayOrders": 5,
      "weekOrders": 25,
      "monthOrders": 100,
      "totalRevenue": 15000,
      "totalDrivers": 15,
      "availableDrivers": 8
    },
    "statusBreakdown": {
      "pending": 20,
      "confirmed": 30,
      "completed": 80,
      "cancelled": 20
    },
    "topCities": [...],
    "recentOrders": [...]
  }
}
```

#### Test 3.2: Orders Analytics
```bash
GET /api/admin/analytics/orders?startDate=2024-01-01&endDate=2024-01-31
```

**Expected Response:** Order analytics for the specified date range

#### Test 3.3: Drivers Analytics
```bash
GET /api/admin/analytics/drivers?startDate=2024-01-01&endDate=2024-01-31
```

**Expected Response:** Driver performance analytics for the specified date range

### 4. Individual Resource Tests

#### Test 4.1: Get Driver by ID
```bash
GET /api/admin/drivers/driver1
```

**Expected Response:** Single driver object

#### Test 4.2: Get Order by ID
```bash
GET /api/admin/orders/order1
```

**Expected Response:** Single order object

#### Test 4.3: Update Order Status
```bash
PATCH /api/admin/orders/order1/status
Content-Type: application/json

{
  "status": "assigntocourier",
  "adminNotes": "Order assigned to courier",
  "courierId": "driver1"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order1",
    "status": "assigntocourier",
    "adminNotes": "Order assigned to courier",
    "courier": "driver1"
  },
  "message": "Order updated successfully"
}
```

## Error Handling Tests

### Test 5.1: Invalid Order ID
```bash
GET /api/admin/orders/invalid-id
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

### Test 5.2: Invalid Status
```bash
PATCH /api/admin/orders/order1/status
Content-Type: application/json

{
  "status": "invalid-status"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

## Frontend Integration Test

### Test 6.1: Driver Assignment Modal
1. Open the admin dashboard
2. Navigate to orders
3. Click on "Assign Driver" for a pending order
4. Verify the modal loads available drivers
5. Select a driver and assign
6. Verify the order status updates

**Expected Behavior:**
- Modal shows available drivers from `/api/admin/drivers?status=available`
- Driver selection updates order status via `/api/admin/orders/{id}/status`
- UI updates to reflect the new assignment

## Notes

- All endpoints return consistent response format with `success` and `data` fields
- Pagination is implemented for list endpoints
- Search functionality works across multiple fields
- Error handling follows the documented format
- Mock data is used for testing; replace with actual database calls in production 