import { createAndEmitNotification } from "../controllers/notification.controller.js";

/**
 * Send notification when booking is created
 */
export const notifyBookingCreated = async (io, booking) => {
  try {
    // Notify the provider
    await createAndEmitNotification(
      io,
      booking.providerId,
      `New booking request from ${booking.userId.name || "a user"}`,
      "booking",
      {
        bookingId: booking._id,
        itemId: booking.itemId,
        type: booking.type,
      },
    );
  } catch (error) {
    console.error("Error sending booking created notification:", error);
  }
};

/**
 * Send notification when booking status is updated
 */
export const notifyBookingStatusUpdate = async (io, booking, newStatus) => {
  try {
    let message = "";
    let notificationType = "booking";

    switch (newStatus) {
      case "accepted":
        message = `Your booking has been accepted by the provider`;
        notificationType = "booking_accepted";
        break;
      case "rejected":
        message = `Your booking has been rejected by the provider`;
        notificationType = "booking_rejected";
        break;
      case "completed":
        message = `Your booking has been completed`;
        notificationType = "booking_completed";
        break;
      case "cancelled":
        message = `Your booking has been cancelled`;
        notificationType = "booking_cancelled";
        break;
      default:
        message = `Your booking status has been updated to ${newStatus}`;
    }

    // Notify the user who made the booking
    await createAndEmitNotification(
      io,
      booking.userId,
      message,
      notificationType,
      {
        bookingId: booking._id,
        itemId: booking.itemId,
        type: booking.type,
        status: newStatus,
      },
    );
  } catch (error) {
    console.error("Error sending booking status update notification:", error);
  }
};

/**
 * Send notification when booking is cancelled by user
 */
export const notifyBookingCancelled = async (io, booking) => {
  try {
    // Notify the provider
    await createAndEmitNotification(
      io,
      booking.providerId,
      `Booking cancelled by ${booking.userId.name || "user"}`,
      "booking_cancelled",
      {
        bookingId: booking._id,
        itemId: booking.itemId,
        type: booking.type,
      },
    );
  } catch (error) {
    console.error("Error sending booking cancelled notification:", error);
  }
};

/**
 * Send notification when payment is received
 */
export const notifyPaymentReceived = async (io, userId, amount) => {
  try {
    await createAndEmitNotification(
      io,
      userId,
      `Payment of ₹${amount} received successfully`,
      "payment",
      {
        amount,
      },
    );
  } catch (error) {
    console.error("Error sending payment notification:", error);
  }
};

/**
 * Send notification when review is added
 */
export const notifyReviewAdded = async (
  io,
  providerId,
  reviewerName,
  rating,
) => {
  try {
    await createAndEmitNotification(
      io,
      providerId,
      `${reviewerName} left a ${rating}-star review on your service`,
      "review",
      {
        reviewerName,
        rating,
      },
    );
  } catch (error) {
    console.error("Error sending review notification:", error);
  }
};

/**
 * Send system notification
 */
export const notifySystem = async (io, userId, message, metadata = {}) => {
  try {
    await createAndEmitNotification(io, userId, message, "system", metadata);
  } catch (error) {
    console.error("Error sending system notification:", error);
  }
};
