import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const count = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalUsers: count,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get User Details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's bookings count
    const bookingsCount = await Booking.countDocuments({ userId });

    // Get user's reviews count
    const reviewsCount = await Review.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: {
        user,
        stats: {
          bookings: bookingsCount,
          reviews: reviewsCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

// Update User Role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "provider", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Delete user's related data
    // await Booking.deleteMany({ userId });
    // await Review.deleteMany({ userId });
    // await Notification.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUserId: userId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    // Execute query with pagination
    const bookings = await Booking.find(query)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        bookings,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalBookings: count,
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

// Delete Booking
export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      data: {
        deletedBookingId: bookingId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// Get All Reviews
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    // Build query
    const query = {};
    if (type) {
      query.type = type;
    }

    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate("userId", "name city")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalReviews: count,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        deletedReviewId: reviewId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// Get Platform Statistics
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      totalReviews,
      totalMaids,
      totalChefs,
      totalTiffins,
      totalHostels,
      totalFlats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "provider" }),
      Booking.countDocuments(),
      Review.countDocuments(),
      Maid.countDocuments(),
      Chef.countDocuments(),
      Tiffin.countDocuments(),
      Hostel.countDocuments(),
      Flat.countDocuments(),
    ]);

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    return res.status(200).json({
      success: true,
      message: "Platform statistics fetched successfully",
      data: {
        users: {
          total: totalUsers,
          providers: totalProviders,
          recentSignups: recentUsers,
        },
        bookings: {
          total: totalBookings,
          byStatus: bookingsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        services: {
          total:
            totalMaids + totalChefs + totalTiffins + totalHostels + totalFlats,
          maids: totalMaids,
          chefs: totalChefs,
          tiffins: totalTiffins,
          hostels: totalHostels,
          flats: totalFlats,
        },
        reviews: {
          total: totalReviews,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching platform statistics",
      error: error.message,
    });
  }
};
