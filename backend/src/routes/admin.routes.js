import express from "express";
import {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllBookings,
  deleteBooking,
  getAllReviews,
  deleteReview,
  getPlatformStats,
} from "../controllers/admin.controller.js";
import { authMiddleware, checkRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication AND admin role
// Use authMiddleware first, then checkRole("admin")

// User Management
router.get("/users", authMiddleware, checkRole("admin"), getAllUsers);
router.get(
  "/users/:userId",
  authMiddleware,
  checkRole("admin"),
  getUserDetails,
);
router.put(
  "/users/:userId/role",
  authMiddleware,
  checkRole("admin"),
  updateUserRole,
);
router.delete("/users/:userId", authMiddleware, checkRole("admin"), deleteUser);

// Booking Management
router.get("/bookings", authMiddleware, checkRole("admin"), getAllBookings);
router.delete(
  "/bookings/:bookingId",
  authMiddleware,
  checkRole("admin"),
  deleteBooking,
);

// Review Management
router.get("/reviews", authMiddleware, checkRole("admin"), getAllReviews);
router.delete(
  "/reviews/:reviewId",
  authMiddleware,
  checkRole("admin"),
  deleteReview,
);

// Platform Statistics
router.get("/stats", authMiddleware, checkRole("admin"), getPlatformStats);

export default router;
