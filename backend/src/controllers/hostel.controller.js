import Hostel from "../models/Hostel.js";
import User from "../models/User.js";

// Create Hostel Listing
export const createHostel = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      rent,
      roomsAvailable,
      amenities,
      gender,
      foodIncluded,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !location || !rent || roomsAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided (name, phone, location, rent, roomsAvailable)",
      });
    }

    // Check if user already has a hostel listing
    const existingHostel = await Hostel.findOne({ userId: req.user._id });
    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: "You already have a hostel listing",
      });
    }

    // Create hostel listing with userId from authenticated user
    const hostel = await Hostel.create({
      userId: req.user._id,
      name,
      phone,
      location,
      rent,
      roomsAvailable,
      amenities: amenities || [],
      gender: gender || "co-ed",
      foodIncluded: foodIncluded || false,
    });

    // Update user role to "provider"
    await User.findByIdAndUpdate(req.user._id, { role: "provider" });

    return res.status(201).json({
      success: true,
      message: "Hostel listing created successfully",
      data: hostel,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Hostels with Filters
export const getAllHostels = async (req, res) => {
  try {
    const { location, gender, minRent, maxRent, foodIncluded } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (gender) {
      filter.gender = gender;
    }

    if (foodIncluded !== undefined) {
      filter.foodIncluded = foodIncluded === "true";
    }

    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) {
        const min = Number(minRent);
        if (isNaN(min) || min < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minRent value",
          });
        }
        filter.rent.$gte = min;
      }
      if (maxRent) {
        const max = Number(maxRent);
        if (isNaN(max) || max < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maxRent value",
          });
        }
        filter.rent.$lte = max;
      }
    }

    const hostels = await Hostel.find(filter)
      .populate("userId", "name phone city")
      .sort({ rent: 1 });

    return res.status(200).json({
      success: true,
      message: "Hostels fetched successfully",
      count: hostels.length,
      data: hostels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Hostel by ID
export const getHostelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await Hostel.findById(id).populate(
      "userId",
      "name phone city",
    );

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hostel fetched successfully",
      data: hostel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Hostel Listing
export const getMyHostelListing = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ userId: req.user._id }).populate(
      "userId",
      "name phone city",
    );

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "You don't have a hostel listing yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hostel listing fetched successfully",
      data: hostel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Hostel Listing
export const updateHostelListing = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      rent,
      roomsAvailable,
      amenities,
      gender,
      foodIncluded,
    } = req.body;

    const hostel = await Hostel.findOne({ userId: req.user._id });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel listing not found",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (rent !== undefined) updateData.rent = rent;
    if (roomsAvailable !== undefined)
      updateData.roomsAvailable = roomsAvailable;
    if (amenities) updateData.amenities = amenities;
    if (gender) updateData.gender = gender;
    if (foodIncluded !== undefined) updateData.foodIncluded = foodIncluded;

    const updatedHostel = await Hostel.findByIdAndUpdate(
      hostel._id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "name phone city");

    return res.status(200).json({
      success: true,
      message: "Hostel listing updated successfully",
      data: updatedHostel,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Hostel Listing
export const deleteHostelListing = async (req, res) => {
  try {
    const hostel = await Hostel.findOneAndDelete({ userId: req.user._id });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hostel listing deleted successfully",
      data: {
        deletedHostel: {
          id: hostel._id,
          name: hostel.name,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
