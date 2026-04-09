# Real-Time Notifications Implementation Summary

## What Was Implemented

### 1. Notification Model

**File:** `backend/src/models/Notification.js`

Created Notification schema with:

- `userId` - User who receives notification
- `message` - Notification message
- `type` - Notification type (booking, payment, review, system, etc.)
- `isRead` - Read status (default: false)
- `metadata` - Additional data (flexible object)
- `timestamps` - Automatic createdAt and updatedAt

**Indexes:**

- `userId` (indexed)
- `type` (indexed)
- `isRead` (indexed)
- `userId + isRead` (compound index)
- `userId + createdAt` (compound index, descending)

### 2. Socket.IO Configuration

**File:** `backend/src/configs/socket.js`

Implemented Socket.IO with:

- JWT authentication middleware
- User-socket mapping (userId → socketId)
- Connection/disconnection handling
- Helper functions:
  - `getUserSocketId()` - Get socket ID for a user
  - `emitNotificationToUser()` - Send notification to specific user
  - `getConnectedUsers()` - Get all online users
  - `isUserOnline()` - Check if user is online

### 3. Notification Controller

**File:** `backend/src/controllers/notification.controller.js`

Implemented 5 controller functions:

- `getUserNotifications` - Get all notifications with unread count
- `markNotificationAsRead` - Mark single notification as read
- `markAllNotificationsAsRead` - Mark all user's notifications as read
- `deleteNotification` - Delete notification
- `createAndEmitNotification` - Helper to create and emit notification

### 4. Notification Routes

**File:** `backend/src/routes/notification.routes.js`

Created 4 API endpoints:

- `GET /api/notifications/:userId` (auth required)
- `PUT /api/notifications/:id/read` (auth required)
- `POST /api/notifications/read-all` (auth required)
- `DELETE /api/notifications/delete/:id` (auth required)

### 5. Notification Helpers

**File:** `backend/src/utils/notificationHelper.js`

Created helper functions for common notifications:

- `notifyBookingCreated()` - Notify provider of new booking
- `notifyBookingStatusUpdate()` - Notify user of status change
- `notifyBookingCancelled()` - Notify provider of cancellation
- `notifyPaymentReceived()` - Notify user of payment
- `notifyReviewAdded()` - Notify provider of new review
- `notifySystem()` - Send system notification

### 6. Main Server Integration

**File:** `backend/index.js`

Updated to:

- Import `http` module and create HTTP server
- Initialize Socket.IO with the server
- Make `io` instance accessible to routes via `app.set("io", io)`
- Register notification routes

---

## Installation

### Install Socket.IO

```bash
cd backend
npm install socket.io
```

### Install Client Library (Frontend)

```bash
npm install socket.io-client
```

---

## API Endpoints

| Method | Endpoint                        | Auth | Description               |
| ------ | ------------------------------- | ---- | ------------------------- |
| GET    | `/api/notifications/:userId`    | ✓    | Get user notifications    |
| PUT    | `/api/notifications/:id/read`   | ✓    | Mark notification as read |
| POST   | `/api/notifications/read-all`   | ✓    | Mark all as read          |
| DELETE | `/api/notifications/delete/:id` | ✓    | Delete notification       |

---

## Socket.IO Events

### Client → Server

- `ping` - Test connection

### Server → Client

- `connected` - Connection confirmation
- `notification` - New notification received
- `pong` - Ping response

---

## How It Works

### 1. User Connects

```javascript
// Client connects with JWT token
const socket = io("http://localhost:5000", {
  auth: { token: "JWT_TOKEN" },
});

// Server authenticates and stores userId → socketId mapping
```

### 2. Event Occurs (e.g., Booking Created)

```javascript
// In booking controller
const io = req.app.get("io");
await notifyBookingCreated(io, booking);
```

### 3. Notification Created and Emitted

```javascript
// 1. Save notification in database
const notification = await Notification.create({...});

// 2. If user is online, emit via Socket.IO
io.to(userId).emit("notification", notification);
```

### 4. Client Receives Notification

```javascript
// Client listens for notifications
socket.on("notification", (notification) => {
  showToast(notification.message);
  updateNotificationBadge();
});
```

### 5. User Fetches All Notifications

```javascript
// Fetch from database (includes offline notifications)
GET /api/notifications/:userId
```

---

## Key Features

✓ **Real-Time Delivery**: Instant notifications via Socket.IO
✓ **Persistent Storage**: All notifications saved in database
✓ **Offline Support**: Notifications saved even if user is offline
✓ **User-Socket Mapping**: Each user has unique socket connection
✓ **JWT Authentication**: Secure Socket.IO connections
✓ **Targeted Notifications**: Send to specific users only
✓ **Unread Count**: Track unread notifications
✓ **Read Status**: Mark individual or all as read
✓ **Delete Support**: Users can delete notifications
✓ **Metadata Support**: Attach additional data to notifications
✓ **Type-Based**: Different types for different events
✓ **Ownership Validation**: Users can only access their own notifications

---

## Notification Types

| Type                | Use Case                      |
| ------------------- | ----------------------------- |
| `booking`           | General booking notifications |
| `booking_accepted`  | Booking accepted by provider  |
| `booking_rejected`  | Booking rejected by provider  |
| `booking_completed` | Booking completed             |
| `booking_cancelled` | Booking cancelled             |
| `payment`           | Payment related notifications |
| `review`            | Review related notifications  |
| `system`            | System announcements          |

---

## Security Features

1. **Socket Authentication**: JWT token required for connection
2. **User Verification**: Token validated on connection
3. **Ownership Validation**: Users can only access their own notifications
4. **Targeted Delivery**: Notifications sent only to intended user
5. **Secure Mapping**: User-socket mapping stored server-side

---

## Usage Examples

### In Booking Controller

```javascript
import {
  notifyBookingCreated,
  notifyBookingStatusUpdate,
} from "../utils/notificationHelper.js";

export const createBooking = async (req, res) => {
  // ... create booking ...

  const io = req.app.get("io");
  await notifyBookingCreated(io, booking);

  // ... return response ...
};

export const updateBookingStatus = async (req, res) => {
  // ... update booking ...

  const io = req.app.get("io");
  await notifyBookingStatusUpdate(io, booking, newStatus);

  // ... return response ...
};
```

### In Payment Controller

```javascript
import { notifyPaymentReceived } from "../utils/notificationHelper.js";

export const addMoney = async (req, res) => {
  // ... add money to wallet ...

  const io = req.app.get("io");
  await notifyPaymentReceived(io, userId, amount);

  // ... return response ...
};
```

### In Review Controller

```javascript
import { notifyReviewAdded } from "../utils/notificationHelper.js";

export const addReview = async (req, res) => {
  // ... create review ...

  const io = req.app.get("io");
  await notifyReviewAdded(io, providerId, reviewerName, rating);

  // ... return response ...
};
```

---

## Frontend Integration

### Setup Socket Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

socket.on("connected", (data) => {
  console.log("Connected:", data);
});

socket.on("notification", (notification) => {
  // Show toast notification
  toast.info(notification.message);

  // Update notification badge
  updateNotificationCount();
});
```

### Fetch Notifications

```javascript
const fetchNotifications = async () => {
  const response = await fetch(`/api/notifications/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  setNotifications(data.data.notifications);
  setUnreadCount(data.data.unreadCount);
};
```

---

## Testing

See `TEST_NOTIFICATIONS_API.md` for:

- Complete API documentation
- Socket.IO connection examples
- Request/response examples
- Frontend integration examples
- Testing workflow
- Error responses

---

## Database Indexes

Optimized for performance:

- Single field indexes for common queries
- Compound indexes for efficient filtering
- Descending index on createdAt for sorting

---

## Performance Considerations

1. **User-Socket Mapping**: In-memory Map for fast lookups
2. **Targeted Delivery**: Notifications sent only to specific users
3. **Database Indexes**: Optimized queries for fetching notifications
4. **Lean Queries**: Use `.lean()` for faster JSON conversion
5. **Connection Pooling**: Socket.IO handles connection efficiently

---

## Next Steps

1. **Install Socket.IO**:

   ```bash
   cd backend
   npm install socket.io
   ```

2. **Start Server**: Server will initialize Socket.IO automatically

3. **Test Socket Connection**: Use the test examples in documentation

4. **Integrate with Existing Controllers**: Add notification calls to booking, payment, review controllers

5. **Frontend Integration**: Connect frontend to Socket.IO and implement notification UI

6. **Optional Enhancements**:
   - Add notification preferences
   - Implement notification grouping
   - Add push notifications
   - Create notification statistics
   - Add notification sounds
   - Implement notification templates

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── Notification.js          # Notification model
│   ├── configs/
│   │   └── socket.js                # Socket.IO configuration
│   ├── controllers/
│   │   └── notification.controller.js  # Notification controllers
│   ├── routes/
│   │   └── notification.routes.js   # Notification routes
│   └── utils/
│       └── notificationHelper.js    # Helper functions
├── index.js                         # Updated with Socket.IO
└── package.json                     # Add socket.io dependency
```

---

## Quick Commands

```bash
# Install Socket.IO
npm install socket.io

# Start server
npm run dev

# Test notifications
curl -X GET http://localhost:5000/api/notifications/USER_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

- Socket.IO runs on same port as Express server
- Notifications are saved in DB even if user is offline
- User-socket mapping is in-memory (resets on server restart)
- JWT token required for both HTTP and Socket.IO
- Notifications are sorted by creation date (newest first)
- Unread count calculated automatically
- Metadata field allows flexible additional data
