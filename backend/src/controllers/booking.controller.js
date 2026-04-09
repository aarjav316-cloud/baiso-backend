import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const { itemId, type, notes } = req.body;

    // Validate required fields
    if (!itemId || !type) {
      return res.status(400).json({
        success: false,
        message: "itemId and type are required",
      });
    }

    // Validate type
    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Get the service and find providerId
    let service;
    let providerId;

    switch (type) {
      case "maid":
        service = await Maid.findById(itemId);
        // Maid doesn't have userId, so we can't determine provider
        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Maid service not found",
          });
        }
        return res.status(400).json({
          success: false,
          message:
            "Maid bookings are not supported yet (no provider reference)",
        });

      case "chef":
        service = await Chef.findById(itemId);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Chef service not found",
          });
        }
        providerId = service.userId;
        break;

      case "tiffin":
        service = await Tiffin.findById(itemId);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Tiffin service not found",
          });
        }
        providerId = service.userId;
        break;

      case "hostel":
        service = await Hostel.findById(itemId);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Hostel not found",
          });
        }
        providerId = service.userId;
        break;

      case "flat":
        service = await Flat.findById(itemId);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: "Flat not found",
          });
        }
        providerId = service.userId;
        break;
    }

    // Prevent user from booking their own service
    if (providerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own service",
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      providerId,
      itemId,
      type,
      status: "pending",
      notes: notes || "",
    });

    // Populate user and provider details
    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Get All Bookings for a User
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own bookings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own bookings",
      });
    }

    // Get all bookings for the user
    const bookings = await Booking.find({ userId })
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        bookings,
        count: bookings.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Security: Only the user who created the booking can cancel it
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only cancel your own bookings",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      });
    }

    // Update status to cancelled
    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Update Booking Status (Provider/Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "cancelled",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Security: Only provider or admin can update status
    const isProvider =
      booking.providerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized. Only the provider or admin can update booking status",
      });
    }

    // Validate status transitions
    const currentStatus = booking.status;

    // Cannot update cancelled or completed bookings
    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a cancelled booking",
      });
    }

    if (currentStatus === "completed" && status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a completed booking",
      });
    }

    // Update status
    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message,
    });
  }
};

// Get Booking Details
export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking
    const booking = await Booking.findById(id)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Security: Only user, provider, or admin can view booking details
    const isUser = booking.userId._id.toString() === req.user._id.toString();
    const isProvider =
      booking.providerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isUser && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only view your own bookings",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching booking details",
      error: error.message,
    });
  }
};
