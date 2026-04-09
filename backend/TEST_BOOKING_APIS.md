# Booking System API Testing Guide

## Overview

Complete booking system where users can book services (Chef, Tiffin, Hostel, Flat) and providers can manage booking status.

## Base URL

```
http://localhost:5000/api/bookings
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Create Booking

**Endpoint:** `POST /api/bookings/create`

**Description:** Create a new booking for a service

**Request Body:**

```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "type": "chef",
  "notes": "Need chef for weekend party"
}
```

**Fields:**

- `itemId` (required): ID of the service (chef/tiffin/hostel/flat)
- `type` (required): Service type - "chef", "tiffin", "hostel", "flat"
- `notes` (optional): Additional notes for the booking

**Success Response (201):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "phone": "9876543210",
      "city": "Mumbai"
    },
    "providerId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Chef Ramesh",
      "phone": "9876543211",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "status": "pending",
    "notes": "Need chef for weekend party",
    "bookingDate": "2026-04-09T10:30:00.000Z",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing required fields or invalid type
- 400: Cannot book your own service
- 404: Service not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "notes": "Need chef for weekend party"
  }'
```

---

## 2. Get User Bookings

**Endpoint:** `GET /api/bookings/:userId`

**Description:** Get all bookings for a specific user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "phone": "9876543210",
          "city": "Mumbai"
        },
        "providerId": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Chef Ramesh",
          "phone": "9876543211",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439011",
        "type": "chef",
        "status": "pending",
        "notes": "Need chef for weekend party",
        "bookingDate": "2026-04-09T10:30:00.000Z",
        "createdAt": "2026-04-09T10:30:00.000Z",
        "updatedAt": "2026-04-09T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

**Error Responses:**

- 403: Unauthorized (can only access own bookings)
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/bookings/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Cancel Booking

**Endpoint:** `POST /api/bookings/cancel`

**Description:** Cancel a booking (user only)

**Request Body:**

```json
{
  "bookingId": "507f1f77bcf86cd799439012"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "phone": "9876543210",
      "city": "Mumbai"
    },
    "providerId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Chef Ramesh",
      "phone": "9876543211",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "status": "cancelled",
    "notes": "Need chef for weekend party",
    "bookingDate": "2026-04-09T10:30:00.000Z",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:35:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing bookingId
- 400: Booking already cancelled
- 400: Cannot cancel completed booking
- 403: Unauthorized (can only cancel own bookings)
- 404: Booking not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/bookings/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "507f1f77bcf86cd799439012"
  }'
```

---

## 4. Update Booking Status

**Endpoint:** `PUT /api/bookings/:id/status`

**Description:** Update booking status (provider/admin only)

**URL Parameters:**

- `id`: Booking ID

**Request Body:**

```json
{
  "status": "accepted"
}
```

**Valid Status Values:**

- `pending` - Initial status
- `accepted` - Provider accepted the booking
- `rejected` - Provider rejected the booking
- `cancelled` - User cancelled the booking
- `completed` - Service completed

**Success Response (200):**

```json
{
  "success": true,
  "message": "Booking status updated to accepted",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "phone": "9876543210",
      "city": "Mumbai"
    },
    "providerId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Chef Ramesh",
      "phone": "9876543211",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "status": "accepted",
    "notes": "Need chef for weekend party",
    "bookingDate": "2026-04-09T10:30:00.000Z",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:40:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing status
- 400: Invalid status value
- 400: Cannot update cancelled booking
- 400: Cannot change status of completed booking
- 403: Unauthorized (only provider or admin)
- 404: Booking not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/bookings/507f1f77bcf86cd799439012/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "accepted"
  }'
```

---

## 5. Get Booking Details

**Endpoint:** `GET /api/bookings/details/:id`

**Description:** Get detailed information about a specific booking

**URL Parameters:**

- `id`: Booking ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Booking details fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "phone": "9876543210",
      "city": "Mumbai"
    },
    "providerId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Chef Ramesh",
      "phone": "9876543211",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "status": "accepted",
    "notes": "Need chef for weekend party",
    "bookingDate": "2026-04-09T10:30:00.000Z",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:40:00.000Z"
  }
}
```

**Error Responses:**

- 403: Unauthorized (can only view own bookings)
- 404: Booking not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/bookings/details/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Booking Status Flow

```
pending → accepted → completed
        ↓
        rejected

User can cancel at any time (except completed):
pending/accepted → cancelled
```

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Ownership Validation**:
   - Users can only view/cancel their own bookings
   - Providers can only update status of their service bookings
   - Admins have full access
3. **Self-Booking Prevention**: Users cannot book their own services
4. **Status Transition Validation**: Prevents invalid status changes
5. **Completed Booking Protection**: Cannot modify completed bookings

---

## Testing Workflow

### Step 1: Create a Service (as Provider)

First, create a chef/tiffin/hostel/flat service using respective APIs.

### Step 2: Create Booking (as User)

```bash
POST /api/bookings/create
{
  "itemId": "<service_id>",
  "type": "chef",
  "notes": "Test booking"
}
```

### Step 3: View User Bookings

```bash
GET /api/bookings/<user_id>
```

### Step 4: Provider Updates Status

```bash
PUT /api/bookings/<booking_id>/status
{
  "status": "accepted"
}
```

### Step 5: User Cancels (Optional)

```bash
POST /api/bookings/cancel
{
  "bookingId": "<booking_id>"
}
```

### Step 6: View Booking Details

```bash
GET /api/bookings/details/<booking_id>
```

---

## Common Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

---

## Notes

1. **Maid Bookings**: Currently not supported as Maid model doesn't have userId reference
2. **Provider ID**: Automatically extracted from the service (Chef/Tiffin/Hostel/Flat)
3. **Booking Date**: Automatically set to current date/time
4. **Sorting**: Bookings are returned in descending order (newest first)
5. **Population**: User and provider details are automatically populated in responses

---

## Implementation Details

### Models Used:

- `Booking`: Main booking model
- `User`: For user and provider details
- `Chef`, `Tiffin`, `Hostel`, `Flat`: Service models

### Middleware:

- `authMiddleware`: JWT authentication and user attachment

### Controllers:

- `createBooking`: Creates new booking with validation
- `getUserBookings`: Fetches user's bookings with security checks
- `cancelBooking`: Cancels booking with ownership validation
- `updateBookingStatus`: Updates status with provider/admin authorization
- `getBookingDetails`: Fetches single booking with access control

---

## Quick Test Commands

Replace `YOUR_JWT_TOKEN` and IDs with actual values:

```bash
# Create booking
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"itemId":"SERVICE_ID","type":"chef","notes":"Test"}'

# Get user bookings
curl -X GET http://localhost:5000/api/bookings/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Cancel booking
curl -X POST http://localhost:5000/api/bookings/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"bookingId":"BOOKING_ID"}'

# Update status (as provider)
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status":"accepted"}'

# Get booking details
curl -X GET http://localhost:5000/api/bookings/details/BOOKING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
