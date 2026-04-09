# Analytics API Testing Guide

## Overview

Optimized analytics system using MongoDB aggregation pipelines to provide meaningful insights about users, providers, and marketplace.

## Base URL

```
http://localhost:5000/api/analytics
```

## Authentication

User and Provider analytics require JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get User Analytics

**Endpoint:** `GET /api/analytics/user/:userId`

**Authentication:** Required

**Description:** Get comprehensive analytics for a user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "User analytics fetched successfully",
  "data": {
    "bookings": {
      "total": 15,
      "completed": 10,
      "cancelled": 2,
      "pending": 2,
      "accepted": 1
    },
    "wallet": {
      "balance": 5000
    },
    "bookingsByType": [
      {
        "type": "chef",
        "count": 8
      },
      {
        "type": "tiffin",
        "count": 4
      },
      {
        "type": "hostel",
        "count": 3
      }
    ],
    "recentActivity": {
      "bookingsLast30Days": 5
    }
  }
}
```

**Data Includes:**

- Total bookings count
- Bookings by status (completed, cancelled, pending, accepted)
- Wallet balance
- Bookings distribution by type
- Recent activity (last 30 days)

**Error Responses:**

- 400: Invalid user ID
- 403: Unauthorized (accessing another user's analytics)
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/analytics/user/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 2. Get Provider Analytics

**Endpoint:** `GET /api/analytics/provider/:userId/:type`

**Authentication:** Required

**Description:** Get analytics for a provider's specific service type

**URL Parameters:**

- `userId`: User ID (must match authenticated user)
- `type`: Service type - "maid", "chef", "tiffin", "hostel", "flat"

**Success Response (200):**

```json
{
  "success": true,
  "message": "Provider analytics fetched successfully",
  "data": {
    "serviceType": "chef",
    "services": {
      "total": 1,
      "price": 15000,
      "location": "Mumbai"
    },
    "bookings": {
      "total": 25,
      "completed": 18,
      "accepted": 3,
      "pending": 2,
      "rejected": 1,
      "cancelled": 1
    },
    "earnings": {
      "estimated": 270000,
      "completedBookings": 18
    },
    "recentActivity": {
      "bookingsLast7Days": [
        {
          "date": "2026-04-03",
          "count": 2
        },
        {
          "date": "2026-04-05",
          "count": 1
        },
        {
          "date": "2026-04-09",
          "count": 3
        }
      ]
    }
  }
}
```

**Data Includes:**

- Service type and details
- Total services created
- Service price/rent and location
- Bookings received (total and by status)
- Estimated earnings (completed bookings × price)
- Recent booking trend (last 7 days)

**Error Responses:**

- 400: Invalid user ID or type
- 403: Unauthorized (accessing another user's analytics)
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/analytics/provider/507f1f77bcf86cd799439013/chef \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Get Marketplace Analytics

**Endpoint:** `GET /api/analytics/marketplace`

**Authentication:** Not required (public)

**Description:** Get overall marketplace statistics

**Success Response (200):**

```json
{
  "success": true,
  "message": "Marketplace analytics fetched successfully",
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalProviders": 320,
      "totalBookings": 4580,
      "totalServices": 450
    },
    "services": {
      "maids": 80,
      "chefs": 120,
      "tiffins": 95,
      "hostels": 85,
      "flats": 70
    },
    "bookings": {
      "byType": [
        {
          "type": "chef",
          "count": 1850
        },
        {
          "type": "tiffin",
          "count": 1200
        },
        {
          "type": "hostel",
          "count": 890
        },
        {
          "type": "flat",
          "count": 420
        },
        {
          "type": "maid",
          "count": 220
        }
      ],
      "byStatus": {
        "completed": 3200,
        "pending": 580,
        "accepted": 420,
        "cancelled": 280,
        "rejected": 100
      },
      "mostPopular": {
        "type": "chef",
        "count": 1850
      }
    },
    "recentActivity": {
      "newUsersLast30Days": 85,
      "newBookingsLast30Days": 320
    }
  }
}
```

**Data Includes:**

- Total users, providers, bookings, and services
- Service breakdown by type
- Bookings distribution by type and status
- Most popular service type
- Recent activity (last 30 days)

**Error Responses:**

- 500: Internal server error

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/analytics/marketplace
```

---

## MongoDB Aggregation Pipelines Used

### User Analytics - Booking Stats

```javascript
Booking.aggregate([
  {
    $match: {
      userId: ObjectId(userId),
    },
  },
  {
    $group: {
      _id: null,
      totalBookings: { $sum: 1 },
      completedBookings: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
      },
      cancelledBookings: {
        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
      },
    },
  },
]);
```

### User Analytics - Booking Type Distribution

```javascript
Booking.aggregate([
  {
    $match: {
      userId: ObjectId(userId),
    },
  },
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
    },
  },
  {
    $sort: { count: -1 },
  },
]);
```

### Provider Analytics - Booking Stats

```javascript
Booking.aggregate([
  {
    $match: {
      providerId: ObjectId(userId),
      type: serviceType,
    },
  },
  {
    $group: {
      _id: null,
      totalBookings: { $sum: 1 },
      completedBookings: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
      },
    },
  },
]);
```

### Marketplace Analytics - Bookings by Type

```javascript
Booking.aggregate([
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
    },
  },
  {
    $sort: { count: -1 },
  },
]);
```

---

## Performance Optimizations

### 1. Aggregation Pipelines

- Single query instead of multiple find operations
- Server-side processing reduces data transfer
- Efficient grouping and counting

### 2. Parallel Execution

```javascript
const [result1, result2, result3] = await Promise.all([query1, query2, query3]);
```

### 3. Indexed Fields

- Queries use indexed fields (userId, providerId, type, status)
- Fast lookups and filtering

### 4. Conditional Aggregation

```javascript
$sum: {
  $cond: [{ $eq: ["$status", "completed"] }, 1, 0];
}
```

- Single pass through data
- Multiple counters in one query

---

## Use Cases

### User Dashboard

```javascript
GET /api/analytics/user/:userId
// Display user's booking history, wallet balance, and activity
```

### Provider Dashboard

```javascript
GET /api/analytics/provider/:userId/chef
// Show provider's earnings, bookings received, and trends
```

### Admin Dashboard

```javascript
GET / api / analytics / marketplace;
// Overview of entire platform performance
```

---

## Testing Workflow

### Step 1: Test User Analytics

```bash
GET /api/analytics/user/<user_id>
```

Expected: User's booking stats and wallet balance

### Step 2: Test Provider Analytics

```bash
GET /api/analytics/provider/<user_id>/chef
```

Expected: Provider's service stats and earnings

### Step 3: Test Marketplace Analytics

```bash
GET /api/analytics/marketplace
```

Expected: Overall platform statistics

---

## Common Error Codes

- **200**: Success
- **400**: Bad request (invalid ID or type)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (accessing another user's data)
- **500**: Internal server error

---

## Query Performance Tips

### DO:

✓ Use aggregation pipelines for complex queries
✓ Leverage indexes on frequently queried fields
✓ Use Promise.all for parallel independent queries
✓ Use $match early in pipeline to filter data
✓ Use $project to limit returned fields

### DON'T:

✗ Use multiple find queries when aggregation can do it in one
✗ Fetch all documents and filter in JavaScript
✗ Ignore indexes on query fields
✗ Use synchronous operations
✗ Return unnecessary data

---

## Sample Responses

### User with No Bookings

```json
{
  "bookings": {
    "total": 0,
    "completed": 0,
    "cancelled": 0,
    "pending": 0,
    "accepted": 0
  },
  "wallet": {
    "balance": 0
  },
  "bookingsByType": [],
  "recentActivity": {
    "bookingsLast30Days": 0
  }
}
```

### Provider with No Bookings

```json
{
  "serviceType": "chef",
  "services": {
    "total": 1,
    "price": 15000,
    "location": "Mumbai"
  },
  "bookings": {
    "total": 0,
    "completed": 0,
    "accepted": 0,
    "pending": 0,
    "rejected": 0,
    "cancelled": 0
  },
  "earnings": {
    "estimated": 0,
    "completedBookings": 0
  },
  "recentActivity": {
    "bookingsLast7Days": []
  }
}
```

---

## Quick Test Commands

```bash
# User analytics
curl -X GET http://localhost:5000/api/analytics/user/USER_ID \
  -H "Authorization: Bearer TOKEN"

# Provider analytics
curl -X GET http://localhost:5000/api/analytics/provider/USER_ID/chef \
  -H "Authorization: Bearer TOKEN"

# Marketplace analytics
curl -X GET http://localhost:5000/api/analytics/marketplace
```

---

## Frontend Integration Example

```javascript
// Fetch user analytics
const fetchUserAnalytics = async (userId, token) => {
  const response = await fetch(`/api/analytics/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fetch provider analytics
const fetchProviderAnalytics = async (userId, type, token) => {
  const response = await fetch(`/api/analytics/provider/${userId}/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Fetch marketplace analytics
const fetchMarketplaceAnalytics = async () => {
  const response = await fetch("/api/analytics/marketplace");
  return response.json();
};

// Display in dashboard
const displayAnalytics = async () => {
  const data = await fetchUserAnalytics(userId, token);

  // Update UI
  document.getElementById("total-bookings").textContent =
    data.data.bookings.total;
  document.getElementById("wallet-balance").textContent =
    data.data.wallet.balance;

  // Create chart for bookings by type
  createChart(data.data.bookingsByType);
};
```

---

## Notes

1. **Aggregation Pipelines**: All queries optimized using MongoDB aggregation
2. **Parallel Execution**: Independent queries run in parallel using Promise.all
3. **Security**: User and provider analytics require authentication
4. **Public Data**: Marketplace analytics is public (can be restricted to admin)
5. **Estimated Earnings**: Calculated as completed bookings × service price
6. **Recent Activity**: Last 30 days for users, last 7 days for providers
7. **Type Validation**: Service type validated before querying
8. **Ownership**: Users can only access their own analytics

---

## Implementation Details

### Models Used:

- `User` - For user count and wallet data
- `Booking` - For booking statistics
- `Maid`, `Chef`, `Tiffin`, `Hostel`, `Flat` - For service counts

### Aggregation Operators:

- `$match` - Filter documents
- `$group` - Group and aggregate data
- `$sum` - Count and sum values
- `$cond` - Conditional aggregation
- `$sort` - Sort results
- `$dateToString` - Format dates

### Performance Features:

- Single aggregation queries instead of multiple finds
- Parallel execution with Promise.all
- Indexed field queries
- Efficient grouping and counting
- Minimal data transfer
