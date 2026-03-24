import { createMaid, getAllMaids } from "../controllers/maid.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get("/", authMiddleware, getAllMaids);
router.post("/", authMiddleware, createMaid);

export default router;
