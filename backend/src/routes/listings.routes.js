import express from "express";
import {
  getAllListings,
  updateListing,
} from "../controllers/listings.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route (no authentication required)
router.get("/all", getAllListings);

// Protected route (authentication required)
router.put("/:type/:userId", authMiddleware, updateListing);

export default router;
