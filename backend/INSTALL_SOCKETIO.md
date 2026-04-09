# Socket.IO Installation and Setup Guide

## Step 1: Install Socket.IO

```bash
cd backend
npm install socket.io
```

## Step 2: Verify Installation

Check that `socket.io` is added to `package.json`:

```json
{
  "dependencies": {
    "socket.io": "^4.x.x"
  }
}
```

## Step 3: Start Server

```bash
npm run dev
```

You should see:

```
backend running on port 5000
Socket.IO server initialized
```

## Step 4: Test Socket.IO Connection

### Using Browser Console

```javascript
// Load Socket.IO client from CDN
const script = document.createElement("script");
script.src = "https://cdn.socket.io/4.5.4/socket.io.min.js";
document.head.appendChild(script);

// Wait for script to load, then connect
setTimeout(() => {
  const socket = io("http://localhost:5000", {
    auth: {
      token: "YOUR_JWT_TOKEN", // Replace with actual token
    },
  });

  socket.on("connected", (data) => {
    console.log("Connected:", data);
  });

  socket.on("notification", (notification) => {
    console.log("Notification:", notification);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
  });
}, 1000);
```

### Using Node.js Test Script

Create `test-socket.js`:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN", // Replace with actual token
  },
});

socket.on("connected", (data) => {
  console.log("✓ Connected:", data);
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error("✗ Connection error:", error.message);
  process.exit(1);
});
```

Install client and run:

```bash
npm install socket.io-client
node test-socket.js
```

## Step 5: Test HTTP APIs

### Get Notifications

```bash
curl -X GET http://localhost:5000/api/notifications/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [],
    "count": 0,
    "unreadCount": 0
  }
}
```

## Step 6: Test Notification Creation

You can manually create a notification to test:

```javascript
// In any controller where you have access to io
const io = req.app.get("io");

// Import the helper
import { createAndEmitNotification } from "../controllers/notification.controller.js";

// Create and emit notification
await createAndEmitNotification(
  io,
  userId,
  "Test notification message",
  "system",
  { test: true },
);
```

## Troubleshooting

### Issue: "Cannot find module 'socket.io'"

**Solution:**

```bash
npm install socket.io
```

### Issue: "Authentication error: No token provided"

**Solution:** Make sure you're passing the JWT token in the auth object:

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_VALID_JWT_TOKEN",
  },
});
```

### Issue: "Authentication error: Invalid token"

**Solution:**

1. Verify your JWT token is valid
2. Check JWT_SECRET in `.env` matches the one used to generate token
3. Ensure token hasn't expired

### Issue: CORS errors

**Solution:** Update CORS configuration in `backend/src/configs/socket.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

### Issue: Socket connects but no notifications received

**Solution:**

1. Check that user is authenticated
2. Verify userId matches the notification's userId
3. Check server logs for notification emission
4. Ensure you're listening to the 'notification' event

## Frontend Setup (React Example)

### Install Socket.IO Client

```bash
npm install socket.io-client
```

### Create Socket Hook

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

    newSocket.on("connected", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
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

### Use in Component

```javascript
import { useSocket } from "./hooks/useSocket";
import { useEffect } from "react";

function App() {
  const token = localStorage.getItem("token");
  const { socket, connected } = useSocket(token);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (notification) => {
      console.log("New notification:", notification);
      // Show toast, update UI, etc.
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  return (
    <div>
      <p>Socket Status: {connected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
```

## Verification Checklist

- [ ] Socket.IO installed (`npm list socket.io`)
- [ ] Server starts without errors
- [ ] Socket.IO initialization message appears in logs
- [ ] Can connect to Socket.IO with valid JWT token
- [ ] Receive 'connected' event on connection
- [ ] HTTP notification APIs work
- [ ] Can create and receive notifications
- [ ] Notifications saved in database
- [ ] User-socket mapping works correctly

## Next Steps

1. ✓ Install Socket.IO
2. ✓ Test connection
3. ✓ Test HTTP APIs
4. → Integrate with existing controllers (booking, payment, review)
5. → Build frontend notification UI
6. → Add notification sounds/badges
7. → Deploy to production

## Production Considerations

### Environment Variables

Add to `.env`:

```
SOCKET_IO_CORS_ORIGIN=https://your-frontend-domain.com
```

Update socket config:

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

### Scaling

For multiple server instances, use Redis adapter:

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Support

For issues or questions:

1. Check `TEST_NOTIFICATIONS_API.md` for detailed documentation
2. Review `NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` for architecture
3. Check Socket.IO official docs: https://socket.io/docs/v4/

## Success!

If you can:

- Connect to Socket.IO with JWT token
- Receive the 'connected' event
- Fetch notifications via HTTP API
- See notifications in database

Then your Socket.IO integration is working correctly! 🎉
