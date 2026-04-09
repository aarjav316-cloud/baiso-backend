import express from "express";
import {
  getUserAnalytics,
  getProviderAnalytics,
  getMarketplaceAnalytics,
} from "../controllers/analytics.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// User analytics (requires authentication)
router.get("/user/:userId", authMiddleware, getUserAnalytics);

// Provider analytics (requires authentication)
router.get("/provider/:userId/:type", authMiddleware, getProviderAnalytics);

// Marketplace analytics (public or admin only - currently public)
router.get("/marketplace", getMarketplaceAnalytics);

export default router;
