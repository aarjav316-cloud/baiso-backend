import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";
import mongoose from "mongoose";

// Get User Analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own analytics
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own analytics",
      });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Use aggregation pipeline for efficient query
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          acceptedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get user wallet balance
    const user = await User.findById(userId).select("walletBalance");

    // Get booking type distribution
    const bookingTypeDistribution = await Booking.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get recent bookings count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookingsCount = await Booking.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = bookingStats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      pendingBookings: 0,
      acceptedBookings: 0,
    };

    return res.status(200).json({
      success: true,
      message: "User analytics fetched successfully",
      data: {
        bookings: {
          total: stats.totalBookings,
          completed: stats.completedBookings,
          cancelled: stats.cancelledBookings,
          pending: stats.pendingBookings,
          accepted: stats.acceptedBookings,
        },
        wallet: {
          balance: user?.walletBalance || 0,
        },
        bookingsByType: bookingTypeDistribution.map((item) => ({
          type: item._id,
          count: item.count,
        })),
        recentActivity: {
          bookingsLast30Days: recentBookingsCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user analytics",
      error: error.message,
    });
  }
};

// Get Provider Analytics
export const getProviderAnalytics = async (req, res) => {
  try {
    const { userId, type } = req.params;

    // Security: Ensure user can only access their own analytics
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own analytics",
      });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Validate type
    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Select the correct model
    let Model;
    let priceField = "price";

    switch (type.toLowerCase()) {
      case "maid":
        Model = Maid;
        break;
      case "chef":
        Model = Chef;
        priceField = "price";
        break;
      case "tiffin":
        Model = Tiffin;
        priceField = "price";
        break;
      case "hostel":
        Model = Hostel;
        priceField = "rent";
        break;
      case "flat":
        Model = Flat;
        priceField = "rent";
        break;
    }

    // Count services created by provider
    const servicesCount = await Model.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Get service details (for services with userId field)
    let serviceDetails = null;
    if (type.toLowerCase() !== "maid") {
      serviceDetails = await Model.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).select(`${priceField} location`);
    }

    // Get bookings received by provider using aggregation
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(userId),
          type: type.toLowerCase(),
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          acceptedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          rejectedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get booking trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = await Booking.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(userId),
          type: type.toLowerCase(),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const stats = bookingStats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      acceptedBookings: 0,
      pendingBookings: 0,
      rejectedBookings: 0,
      cancelledBookings: 0,
    };

    // Calculate estimated earnings (completed bookings * price)
    let estimatedEarnings = 0;
    if (serviceDetails && serviceDetails[priceField]) {
      estimatedEarnings = stats.completedBookings * serviceDetails[priceField];
    }

    return res.status(200).json({
      success: true,
      message: "Provider analytics fetched successfully",
      data: {
        serviceType: type.toLowerCase(),
        services: {
          total: servicesCount,
          price: serviceDetails?.[priceField] || 0,
          location: serviceDetails?.location || "N/A",
        },
        bookings: {
          total: stats.totalBookings,
          completed: stats.completedBookings,
          accepted: stats.acceptedBookings,
          pending: stats.pendingBookings,
          rejected: stats.rejectedBookings,
          cancelled: stats.cancelledBookings,
        },
        earnings: {
          estimated: estimatedEarnings,
          completedBookings: stats.completedBookings,
        },
        recentActivity: {
          bookingsLast7Days: recentBookings.map((item) => ({
            date: item._id,
            count: item.count,
          })),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching provider analytics",
      error: error.message,
    });
  }
};

// Get Marketplace Analytics
export const getMarketplaceAnalytics = async (req, res) => {
  try {
    // Use Promise.all for parallel execution of independent queries
    const [
      totalUsers,
      totalBookings,
      totalProviders,
      bookingsByType,
      bookingsByStatus,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      // Total users
      User.countDocuments(),

      // Total bookings
      Booking.countDocuments(),

      // Total providers (users with role 'provider')
      User.countDocuments({ role: "provider" }),

      // Bookings by type (most popular service)
      Booking.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),

      // Bookings by status
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent users (last 30 days)
      User.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),

      // Recent bookings (last 30 days)
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Get service counts using aggregation
    const [totalMaids, totalChefs, totalTiffins, totalHostels, totalFlats] =
      await Promise.all([
        Maid.countDocuments(),
        Chef.countDocuments(),
        Tiffin.countDocuments(),
        Hostel.countDocuments(),
        Flat.countDocuments(),
      ]);

    // Most popular service type
    const mostPopularService = bookingsByType[0] || { _id: "N/A", count: 0 };

    // Format bookings by status
    const statusDistribution = {};
    bookingsByStatus.forEach((item) => {
      statusDistribution[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: "Marketplace analytics fetched successfully",
      data: {
        overview: {
          totalUsers,
          totalProviders,
          totalBookings,
          totalServices:
            totalMaids + totalChefs + totalTiffins + totalHostels + totalFlats,
        },
        services: {
          maids: totalMaids,
          chefs: totalChefs,
          tiffins: totalTiffins,
          hostels: totalHostels,
          flats: totalFlats,
        },
        bookings: {
          byType: bookingsByType.map((item) => ({
            type: item._id,
            count: item.count,
          })),
          byStatus: statusDistribution,
          mostPopular: {
            type: mostPopularService._id,
            count: mostPopularService.count,
          },
        },
        recentActivity: {
          newUsersLast30Days: recentUsers,
          newBookingsLast30Days: recentBookings,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching marketplace analytics",
      error: error.message,
    });
  }
};
