import express from "express";
import {
  createFlat,
  getAllFlats,
  getFlatById,
  getMyFlatListing,
  updateFlatListing,
  deleteFlatListing,
} from "../controllers/flat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllFlats);
router.get("/:id", getFlatById);

// Protected routes (require authentication)
router.post("/", authMiddleware, createFlat);
router.get("/me/listing", authMiddleware, getMyFlatListing);
router.put("/me/listing", authMiddleware, updateFlatListing);
router.delete("/me/listing", authMiddleware, deleteFlatListing);

export default router;
