import Notification from "../models/Notification.js";

// Get User Notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own notifications
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own notifications",
      });
    }

    // Get all notifications for the user
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        count: notifications.length,
        unreadCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark Notification as Read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find notification
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Security: Ensure user can only mark their own notifications as read
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized. You can only mark your own notifications as read",
      });
    }

    // Mark as read
    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark All Notifications as Read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Find notification
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Security: Ensure user can only delete their own notifications
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own notifications",
      });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: {
        deletedNotificationId: id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Helper function to create and emit notification
export const createAndEmitNotification = async (
  io,
  userId,
  message,
  type,
  metadata = {},
) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      userId,
      message,
      type,
      metadata,
      isRead: false,
    });

    // Emit real-time notification to user if online
    if (io) {
      const { emitNotificationToUser } = await import("../configs/socket.js");
      emitNotificationToUser(io, userId, notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
