# Admin APIs Testing Guide

## Overview

Admin-only APIs for managing users, bookings, reviews, and viewing platform statistics. All endpoints require admin role.

## Base URL

```
http://localhost:5000/api/admin
```

## Authentication & Authorization

All endpoints require:

1. Valid JWT token in Authorization header
2. User role must be "admin"

```
Authorization: Bearer <your_jwt_token>
```

**Note:** If user is not admin, will receive 403 Forbidden error.

---

## User Management

### 1. Get All Users

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role - "user", "provider", "admin"
- `search` (optional): Search by name, phone, or city

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "phone": "9876543210",
        "city": "Mumbai",
        "role": "user",
        "walletBalance": 5000,
        "createdAt": "2026-04-09T10:30:00.000Z",
        "updatedAt": "2026-04-09T10:30:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalUsers": 100
  }
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=20&role=provider" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

### 2. Get User Details

**Endpoint:** `GET /api/admin/users/:userId`

**URL Parameters:**

- `userId`: User ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "User details fetched successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "phone": "9876543210",
      "city": "Mumbai",
      "role": "provider",
      "walletBalance": 5000,
      "addresses": [],
      "savedItems": [],
      "createdAt": "2026-04-09T10:30:00.000Z"
    },
    "stats": {
      "bookings": 15,
      "reviews": 8
    }
  }
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/admin/users/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

### 3. Update User Role

**Endpoint:** `PUT /api/admin/users/:userId/role`

**URL Parameters:**

- `userId`: User ID

**Request Body:**

```json
{
  "role": "provider"
}
```

**Valid Roles:**

- `user`
- `provider`
- `admin`

**Success Response (200):**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "John Doe",
    "phone": "9876543210",
    "city": "Mumbai",
    "role": "provider",
    "updatedAt": "2026-04-09T11:00:00.000Z"
  }
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/admin/users/507f1f77bcf86cd799439013/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{"role": "provider"}'
```

---

### 4. Delete User

**Endpoint:** `DELETE /api/admin/users/:userId`

**URL Parameters:**

- `userId`: User ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "507f1f77bcf86cd799439013"
  }
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/admin/users/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Booking Management

### 5. Get All Bookings

**Endpoint:** `GET /api/admin/bookings`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status - "pending", "accepted", "rejected", "cancelled", "completed"
- `type` (optional): Filter by type - "maid", "chef", "tiffin", "hostel", "flat"

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "phone": "9876543210",
          "city": "Mumbai"
        },
        "providerId": {
          "_id": "507f1f77bcf86cd799439015",
          "name": "Chef Ramesh",
          "phone": "9876543211",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439016",
        "type": "chef",
        "status": "completed",
        "createdAt": "2026-04-09T10:30:00.000Z"
      }
    ],
    "totalPages": 10,
    "currentPage": 1,
    "totalBookings": 200
  }
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:5000/api/admin/bookings?status=completed&type=chef" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

### 6. Delete Booking

**Endpoint:** `DELETE /api/admin/bookings/:bookingId`

**URL Parameters:**

- `bookingId`: Booking ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Booking deleted successfully",
  "data": {
    "deletedBookingId": "507f1f77bcf86cd799439014"
  }
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/admin/bookings/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Review Management

### 7. Get All Reviews

**Endpoint:** `GET /api/admin/reviews`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type - "maid", "chef", "tiffin", "hostel", "flat"

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439016",
        "type": "chef",
        "rating": 5,
        "comment": "Excellent service!",
        "createdAt": "2026-04-09T10:30:00.000Z"
      }
    ],
    "totalPages": 8,
    "currentPage": 1,
    "totalReviews": 150
  }
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:5000/api/admin/reviews?type=chef" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

### 8. Delete Review

**Endpoint:** `DELETE /api/admin/reviews/:reviewId`

**URL Parameters:**

- `reviewId`: Review ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "deletedReviewId": "507f1f77bcf86cd799439017"
  }
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/admin/reviews/507f1f77bcf86cd799439017 \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Platform Statistics

### 9. Get Platform Stats

**Endpoint:** `GET /api/admin/stats`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Platform statistics fetched successfully",
  "data": {
    "users": {
      "total": 1250,
      "providers": 320,
      "recentSignups": 45
    },
    "bookings": {
      "total": 4580,
      "byStatus": {
        "completed": 3200,
        "pending": 580,
        "accepted": 420,
        "cancelled": 280,
        "rejected": 100
      }
    },
    "services": {
      "total": 450,
      "maids": 80,
      "chefs": 120,
      "tiffins": 95,
      "hostels": 85,
      "flats": 70
    },
    "reviews": {
      "total": 890
    }
  }
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Role-Based Middleware

### checkRole Middleware

The `checkRole` middleware is reusable and can accept multiple roles:

```javascript
// Single role
router.get("/admin-only", authMiddleware, checkRole("admin"), handler);

// Multiple roles
router.get(
  "/admin-or-provider",
  authMiddleware,
  checkRole("admin", "provider"),
  handler,
);
```

### Usage in Routes

```javascript
import { authMiddleware, checkRole } from "../middleware/auth.middleware.js";

// Admin only
router.get("/users", authMiddleware, checkRole("admin"), getAllUsers);

// Admin or Provider
router.get(
  "/dashboard",
  authMiddleware,
  checkRole("admin", "provider"),
  getDashboard,
);

// Any authenticated user (no role check)
router.get("/profile", authMiddleware, getProfile);
```

---

## Error Responses

### 401 Unauthorized (No Token)

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 401 Unauthorized (Invalid Token)

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden (Not Admin)

```json
{
  "success": false,
  "message": "Access denied. Required role: admin"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Testing Workflow

### Step 1: Get Admin Token

First, login as admin user to get JWT token.

### Step 2: Test User Management

```bash
# Get all users
GET /api/admin/users

# Get specific user
GET /api/admin/users/:userId

# Update user role
PUT /api/admin/users/:userId/role

# Delete user
DELETE /api/admin/users/:userId
```

### Step 3: Test Booking Management

```bash
# Get all bookings
GET /api/admin/bookings

# Delete booking
DELETE /api/admin/bookings/:bookingId
```

### Step 4: Test Review Management

```bash
# Get all reviews
GET /api/admin/reviews

# Delete review
DELETE /api/admin/reviews/:reviewId
```

### Step 5: Test Platform Stats

```bash
# Get statistics
GET /api/admin/stats
```

---

## Common Error Codes

- **200**: Success
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (not admin)
- **404**: Resource not found
- **500**: Internal server error

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Authorization**: Only admin users can access
3. **Reusable Middleware**: `checkRole` can be used for any role
4. **Multiple Role Support**: Can check for multiple roles
5. **Sensitive Data Protection**: Passwords and OTPs excluded from responses

---

## Middleware Chain

All admin routes follow this pattern:

```
Request → authMiddleware → checkRole("admin") → Controller → Response
```

1. **authMiddleware**: Verifies JWT token and attaches user to req.user
2. **checkRole("admin")**: Checks if req.user.role === "admin"
3. **Controller**: Executes admin logic
4. **Response**: Returns data or error

---

## Quick Test Commands

```bash
# Get all users
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update user role
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"role":"provider"}'

# Get platform stats
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Delete booking
curl -X DELETE http://localhost:5000/api/admin/bookings/BOOKING_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Notes

1. **Admin Role Required**: All endpoints require user role to be "admin"
2. **Reusable Middleware**: `checkRole` can be used throughout the application
3. **Multiple Roles**: Middleware supports checking multiple roles
4. **Pagination**: List endpoints support pagination
5. **Filtering**: List endpoints support filtering by various parameters
6. **Search**: User list supports search by name, phone, or city
7. **Statistics**: Real-time platform statistics using aggregation
8. **Soft Delete**: Consider implementing soft delete for data recovery
