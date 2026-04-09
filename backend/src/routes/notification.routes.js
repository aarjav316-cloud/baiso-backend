import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All notification routes require authentication
router.get("/:userId", authMiddleware, getUserNotifications);
router.put("/:id/read", authMiddleware, markNotificationAsRead);
router.post("/read-all", authMiddleware, markAllNotificationsAsRead);
router.delete("/delete/:id", authMiddleware, deleteNotification);

export default router;
