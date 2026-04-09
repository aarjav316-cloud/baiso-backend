import express from "express";
import {
  createChef,
  getAllChefs,
  getChefById,
  getMyChefProfile,
  updateChefProfile,
  deleteChefProfile,
} from "../controllers/chef.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllChefs);
router.get("/:id", getChefById);

// Protected routes (require authentication)
router.post("/", authMiddleware, createChef);
router.get("/me/profile", authMiddleware, getMyChefProfile);
router.put("/me/profile", authMiddleware, updateChefProfile);
router.delete("/me/profile", authMiddleware, deleteChefProfile);

export default router;
