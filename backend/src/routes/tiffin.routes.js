import express from "express";
import {
  createTiffin,
  getAllTiffins,
  getTiffinById,
  getMyTiffinService,
  updateTiffinService,
  deleteTiffinService,
} from "../controllers/tiffin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllTiffins);
router.get("/:id", getTiffinById);

// Protected routes (require authentication)
router.post("/", authMiddleware, createTiffin);
router.get("/me/service", authMiddleware, getMyTiffinService);
router.put("/me/service", authMiddleware, updateTiffinService);
router.delete("/me/service", authMiddleware, deleteTiffinService);

export default router;
