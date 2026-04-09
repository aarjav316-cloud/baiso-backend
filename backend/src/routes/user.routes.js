import express from "express";
import {
  unifiedAuth,
  requestOTP,
  getProfile,
  updateProfile,
  deleteAccount,
  getProviderData,
  getWalletBalance,
  addMoneyToWallet,
  getSavedItems,
  addSavedItem,
  removeSavedItem,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/auth", unifiedAuth);
router.post("/request-otp", requestOTP);

// Protected routes (authentication required)
router.get("/profile/:userId", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/account", authMiddleware, deleteAccount);
router.get("/provider-data/:userId", authMiddleware, getProviderData);

// Wallet routes (authentication required)
router.get("/wallet/balance/:userId", authMiddleware, getWalletBalance);
router.post("/wallet/add", authMiddleware, addMoneyToWallet);

// Saved items routes (authentication required)
router.get("/saved/:userId", authMiddleware, getSavedItems);
router.post("/saved/add", authMiddleware, addSavedItem);
router.post("/saved/remove", authMiddleware, removeSavedItem);

export default router;
