import express from "express";
import {
  getPaymentMethods,
  addCard,
  removeCard,
  addUPI,
  removeUPI,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All payment routes require authentication
router.get("/methods/:userId", authMiddleware, getPaymentMethods);
router.post("/card/add", authMiddleware, addCard);
router.post("/card/remove", authMiddleware, removeCard);
router.post("/upi/add", authMiddleware, addUPI);
router.post("/upi/remove", authMiddleware, removeUPI);

export default router;
