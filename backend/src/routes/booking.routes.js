import express from "express";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  updateBookingStatus,
  getBookingDetails,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All booking routes require authentication
router.post("/create", authMiddleware, createBooking);
router.get("/:userId", authMiddleware, getUserBookings);
router.post("/cancel", authMiddleware, cancelBooking);
router.put("/:id/status", authMiddleware, updateBookingStatus);
router.get("/details/:id", authMiddleware, getBookingDetails);

export default router;
