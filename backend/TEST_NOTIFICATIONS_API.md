# Real-Time Notifications API Testing Guide

## Overview

Complete real-time notification system using Socket.IO where users instantly receive updates along with stored notifications.

## Base URL

```
HTTP API: http://localhost:5000/api/notifications
Socket.IO: ws://localhost:5000
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Socket.IO Connection

### Client-Side Connection (JavaScript)

```javascript
import { io } from "socket.io-client";

// Connect to Socket.IO server with authentication
const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN",
  },
});

// Listen for connection
socket.on("connected", (data) => {
  console.log("Connected to notification server:", data);
});

// Listen for notifications
socket.on("notification", (notification) => {
  console.log("New notification:", notification);
  // Display notification to user
  showNotification(notification.message);
});

// Handle disconnect
socket.on("disconnect", () => {
  console.log("Disconnected from notification server");
});

// Optional: Ping-pong for connection testing
socket.emit("ping");
socket.on("pong", (data) => {
  console.log("Pong received:", data);
});
```

### Connection Events

**Connected Event:**

```json
{
  "message": "Connected to notification server",
  "userId": "507f1f77bcf86cd799439013"
}
```

**Notification Event:**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "message": "Your booking has been accepted by the provider",
  "type": "booking_accepted",
  "isRead": false,
  "metadata": {
    "bookingId": "507f1f77bcf86cd799439011",
    "itemId": "507f1f77bcf86cd799439014",
    "type": "chef",
    "status": "accepted"
  },
  "createdAt": "2026-04-09T10:30:00.000Z",
  "updatedAt": "2026-04-09T10:30:00.000Z"
}
```

---

## HTTP API Endpoints

### 1. Get User Notifications

**Endpoint:** `GET /api/notifications/:userId`

**Authentication:** Required

**Description:** Get all notifications for a user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "message": "Your booking has been accepted by the provider",
        "type": "booking_accepted",
        "isRead": false,
        "metadata": {
          "bookingId": "507f1f77bcf86cd799439011",
          "status": "accepted"
        },
        "createdAt": "2026-04-09T10:30:00.000Z",
        "updatedAt": "2026-04-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "userId": "507f1f77bcf86cd799439013",
        "message": "Payment of ₹5000 received successfully",
        "type": "payment",
        "isRead": true,
        "metadata": {
          "amount": 5000
        },
        "createdAt": "2026-04-08T10:30:00.000Z",
        "updatedAt": "2026-04-08T11:00:00.000Z"
      }
    ],
    "count": 2,
    "unreadCount": 1
  }
}
```

**Error Responses:**

- 403: Unauthorized (accessing another user's notifications)
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/notifications/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

**Authentication:** Required

**Description:** Mark a specific notification as read

**URL Parameters:**

- `id`: Notification ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "message": "Your booking has been accepted by the provider",
    "type": "booking_accepted",
    "isRead": true,
    "metadata": {
      "bookingId": "507f1f77bcf86cd799439011"
    },
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:35:00.000Z"
  }
}
```

**Error Responses:**

- 403: Unauthorized (marking another user's notification)
- 404: Notification not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/notifications/507f1f77bcf86cd799439012/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Mark All Notifications as Read

**Endpoint:** `POST /api/notifications/read-all`

**Authentication:** Required

**Description:** Mark all user's notifications as read

**Success Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

**Error Responses:**

- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Delete Notification

**Endpoint:** `DELETE /api/notifications/delete/:id`

**Authentication:** Required

**Description:** Delete a specific notification

**URL Parameters:**

- `id`: Notification ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "deletedNotificationId": "507f1f77bcf86cd799439012"
  }
}
```

**Error Responses:**

- 403: Unauthorized (deleting another user's notification)
- 404: Notification not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/notifications/delete/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notification Types

| Type                | Description                  | Example                           |
| ------------------- | ---------------------------- | --------------------------------- |
| `booking`           | General booking notification | "New booking request from John"   |
| `booking_accepted`  | Booking accepted by provider | "Your booking has been accepted"  |
| `booking_rejected`  | Booking rejected by provider | "Your booking has been rejected"  |
| `booking_completed` | Booking completed            | "Your booking has been completed" |
| `booking_cancelled` | Booking cancelled            | "Your booking has been cancelled" |
| `payment`           | Payment related              | "Payment of ₹5000 received"       |
| `review`            | Review related               | "John left a 5-star review"       |
| `system`            | System notifications         | "Welcome to Baiso!"               |

---

## Notification Model Structure

```javascript
{
  userId: ObjectId,           // User who receives notification
  message: String,            // Notification message
  type: String,               // Notification type
  isRead: Boolean,            // Read status (default: false)
  metadata: Object,           // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

---

## Integration Examples

### Example 1: Booking Created

When a booking is created, notify the provider:

```javascript
// In booking controller
import { notifyBookingCreated } from "../utils/notificationHelper.js";

export const createBooking = async (req, res) => {
  // ... create booking logic ...

  // Get io instance
  const io = req.app.get("io");

  // Send notification
  await notifyBookingCreated(io, booking);

  // ... return response ...
};
```

### Example 2: Booking Status Updated

When booking status changes, notify the user:

```javascript
// In booking controller
import { notifyBookingStatusUpdate } from "../utils/notificationHelper.js";

export const updateBookingStatus = async (req, res) => {
  // ... update booking logic ...

  const io = req.app.get("io");
  await notifyBookingStatusUpdate(io, booking, newStatus);

  // ... return response ...
};
```

### Example 3: Payment Received

When payment is received:

```javascript
import { notifyPaymentReceived } from "../utils/notificationHelper.js";

const io = req.app.get("io");
await notifyPaymentReceived(io, userId, amount);
```

### Example 4: Review Added

When someone reviews your service:

```javascript
import { notifyReviewAdded } from "../utils/notificationHelper.js";

const io = req.app.get("io");
await notifyReviewAdded(io, providerId, reviewerName, rating);
```

---

## Frontend Integration (React Example)

### Setup Socket Connection

```javascript
// hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    newSocket.on("connected", (data) => {
      console.log("Connected:", data);
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
};
```

### Listen for Notifications

```javascript
// components/NotificationListener.jsx
import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { toast } from "react-toastify";

export const NotificationListener = ({ token }) => {
  const { socket } = useSocket(token);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification) => {
      // Show toast notification
      toast.info(notification.message);

      // Update notification count
      updateNotificationCount();

      // Play sound
      playNotificationSound();
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  return null;
};
```

### Fetch Notifications

```javascript
// services/notificationService.js
export const fetchNotifications = async (userId, token) => {
  const response = await fetch(`/api/notifications/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const markAsRead = async (notificationId, token) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const markAllAsRead = async (token) => {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteNotification = async (notificationId, token) => {
  const response = await fetch(`/api/notifications/delete/${notificationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

## Testing Workflow

### Step 1: Connect to Socket.IO

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "YOUR_JWT_TOKEN" },
});
```

### Step 2: Listen for Notifications

```javascript
socket.on("notification", (notification) => {
  console.log("Received:", notification);
});
```

### Step 3: Trigger a Notification

Create a booking or perform an action that triggers a notification.

### Step 4: Fetch All Notifications

```bash
GET /api/notifications/<user_id>
```

### Step 5: Mark as Read

```bash
PUT /api/notifications/<notification_id>/read
```

### Step 6: Delete Notification

```bash
DELETE /api/notifications/delete/<notification_id>
```

---

## Security Features

1. **Socket Authentication**: JWT token required for Socket.IO connection
2. **User-Socket Mapping**: Each user has unique socket connection
3. **Ownership Validation**: Users can only access their own notifications
4. **Targeted Notifications**: Notifications sent only to specific users
5. **Persistent Storage**: Notifications saved in DB even if user is offline

---

## User-Socket Mapping

The system maintains a mapping of userId to socketId:

- When user connects: `userId → socketId` stored
- When user disconnects: mapping removed
- Notifications sent to specific socketId
- If user offline: notification saved in DB only

---

## Common Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (accessing another user's data)
- **404**: Resource not found
- **500**: Internal server error

---

## Database Indexes

For optimal performance:

- `userId` (indexed)
- `type` (indexed)
- `isRead` (indexed)
- `userId + isRead` (compound index)
- `userId + createdAt` (compound index, descending)

---

## Quick Test Commands

```bash
# Get notifications
curl -X GET http://localhost:5000/api/notifications/USER_ID \
  -H "Authorization: Bearer TOKEN"

# Mark as read
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer TOKEN"

# Mark all as read
curl -X POST http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer TOKEN"

# Delete notification
curl -X DELETE http://localhost:5000/api/notifications/delete/NOTIFICATION_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

1. **Real-Time**: Notifications delivered instantly via Socket.IO
2. **Persistent**: All notifications saved in database
3. **Offline Support**: Notifications saved even if user is offline
4. **Unread Count**: API returns count of unread notifications
5. **Metadata**: Additional data can be attached to notifications
6. **Sorted**: Notifications sorted by creation date (newest first)
7. **Type-Based**: Different notification types for different events
