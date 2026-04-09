import express from "express";
import {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/review.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add review (requires authentication)
router.post("/add", authMiddleware, addReview);

// Get reviews for a service (public)
router.get("/:type/:id", getReviews);

// Update review (requires authentication)
router.put("/update/:id", authMiddleware, updateReview);

// Delete review (requires authentication)
router.delete("/delete/:id", authMiddleware, deleteReview);

// Get user reviews (requires authentication)
router.get("/user/:userId", authMiddleware, getUserReviews);

export default router;
