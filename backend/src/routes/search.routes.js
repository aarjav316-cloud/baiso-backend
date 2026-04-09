import express from "express";
import { searchServices } from "../controllers/search.controller.js";

const router = express.Router();

// Search endpoint - no authentication required for public search
router.get("/", searchServices);

export default router;
