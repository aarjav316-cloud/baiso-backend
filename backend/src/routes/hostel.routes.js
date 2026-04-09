import express from "express";
import {
  createHostel,
  getAllHostels,
  getHostelById,
  getMyHostelListing,
  updateHostelListing,
  deleteHostelListing,
} from "../controllers/hostel.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllHostels);
router.get("/:id", getHostelById);

// Protected routes (require authentication)
router.post("/", authMiddleware, createHostel);
router.get("/me/listing", authMiddleware, getMyHostelListing);
router.put("/me/listing", authMiddleware, updateHostelListing);
router.delete("/me/listing", authMiddleware, deleteHostelListing);

export default router;
