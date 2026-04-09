import express from "express";
import { getFiltersByType } from "../controllers/filters.controller.js";

const router = express.Router();

// Get filters by type - no authentication required for public access
router.get("/:type", getFiltersByType);

export default router;
