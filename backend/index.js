import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import maidRoutes from "./src/routes/maid.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import requestRoutes from "./src/routes/request.routes.js";
import chefRoutes from "./src/routes/chef.routes.js";
import tiffinRoutes from "./src/routes/tiffin.routes.js";
import hostelRoutes from "./src/routes/hostel.routes.js";
import flatRoutes from "./src/routes/flat.routes.js";
import listingsRoutes from "./src/routes/listings.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import filtersRoutes from "./src/routes/filters.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import addressRoutes from "./src/routes/address.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

import { connectDB } from "./src/configs/db.js";
import { connectRedis, getRedisClient } from "./src/configs/redis.js";
import { initializeSocket } from "./src/configs/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);
const startTime = Date.now();

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes
app.set("io", io);

app.use(express.json());
app.use(cors());

// Root endpoint - API info
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Baiso API is running",
    data: {
      name: "Baiso API",
      version: "v1",
      status: "running",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        auth: "/api/users",
        listings: "/api/listings",
        maids: "/api/maids",
        chefs: "/api/chefs",
        tiffins: "/api/tiffins",
        hostels: "/api/hostels",
        flats: "/api/flats",
        requests: "/api/requests",
        bookings: "/api/bookings",
        payment: "/api/payment",
        search: "/api/search",
        filters: "/api/filters",
        reviews: "/api/reviews",
        notifications: "/api/notifications",
        addresses: "/api/addresses",
        analytics: "/api/analytics",
        admin: "/api/admin",
      },
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  // Calculate uptime
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  // Check database connection status
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  // Check Redis connection status
  const redisClient = getRedisClient();
  const redisStatus =
    redisClient && redisClient.isOpen ? "connected" : "disconnected";

  // Overall health status
  const isHealthy = mongoStatus === 1 && redisStatus === "connected";

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? "Server is healthy" : "Server is unhealthy",
    data: {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`,
      },
      services: {
        mongodb: {
          status: mongoStatusMap[mongoStatus] || "unknown",
          connected: mongoStatus === 1,
        },
        redis: {
          status: redisStatus,
          connected: redisStatus === "connected",
        },
      },
      server: {
        port: process.env.PORT || 5000,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
      },
    },
  });
});

app.use("/api/maids", maidRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/tiffins", tiffinRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

Promise.all([connectDB(), connectRedis()])
  .then(() => {
    server.listen(PORT, () => {
      console.log(`backend running on port ${PORT}`);
      console.log(`Socket.IO server initialized`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to services:", error);
    process.exit(1);
  });
