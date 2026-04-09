import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Store user-socket mappings
const userSocketMap = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Configure this based on your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      );

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle connections
  io.on("connection", (socket) => {
    const userId = socket.userId;

    // Store user-socket mapping
    userSocketMap.set(userId, socket.id);

    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Join user to their personal room
    socket.join(userId);

    // Send connection confirmation
    socket.emit("connected", {
      message: "Connected to notification server",
      userId: userId,
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
      userSocketMap.delete(userId);
    });

    // Handle custom events (optional)
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });
  });

  return io;
};

// Helper function to get socket ID for a user
export const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

// Helper function to emit notification to specific user
export const emitNotificationToUser = (io, userId, notification) => {
  const userIdStr = userId.toString();
  const socketId = userSocketMap.get(userIdStr);

  if (socketId) {
    // User is online, emit notification
    io.to(userIdStr).emit("notification", notification);
    console.log(`Notification sent to user ${userIdStr}`);
    return true;
  } else {
    // User is offline, notification is already saved in DB
    console.log(`User ${userIdStr} is offline, notification saved in DB`);
    return false;
  }
};

// Get all connected users
export const getConnectedUsers = () => {
  return Array.from(userSocketMap.keys());
};

// Check if user is online
export const isUserOnline = (userId) => {
  return userSocketMap.has(userId.toString());
};

export { userSocketMap };
