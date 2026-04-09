import express from "express";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All address routes require authentication
router.get("/:userId", authMiddleware, getUserAddresses);
router.post("/add", authMiddleware, addAddress);
router.put("/update/:id", authMiddleware, updateAddress);
router.delete("/delete/:id", authMiddleware, deleteAddress);
router.put("/default/:id", authMiddleware, setDefaultAddress);

export default router;
