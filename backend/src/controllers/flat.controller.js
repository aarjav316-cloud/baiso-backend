import Flat from "../models/Flat.js";
import User from "../models/User.js";

// Create Flat Listing
export const createFlat = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      rent,
      bhk,
      furnished,
      deposit,
      availableFrom,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !location || !rent || !bhk || !furnished) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided (name, phone, location, rent, bhk, furnished)",
      });
    }

    // Check if user already has a flat listing
    const existingFlat = await Flat.findOne({ userId: req.user._id });
    if (existingFlat) {
      return res.status(400).json({
        success: false,
        message: "You already have a flat listing",
      });
    }

    // Create flat listing with userId from authenticated user
    const flat = await Flat.create({
      userId: req.user._id,
      name,
      phone,
      location,
      rent,
      bhk,
      furnished,
      deposit: deposit || 0,
      availableFrom: availableFrom || Date.now(),
    });

    // Update user role to "provider"
    await User.findByIdAndUpdate(req.user._id, { role: "provider" });

    return res.status(201).json({
      success: true,
      message: "Flat listing created successfully",
      data: flat,
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

// Get All Flats with Filters
export const getAllFlats = async (req, res) => {
  try {
    const { location, bhk, minRent, maxRent, furnished } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (bhk) {
      filter.bhk = bhk;
    }

    if (furnished) {
      filter.furnished = furnished;
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

    const flats = await Flat.find(filter)
      .populate("userId", "name phone city")
      .sort({ rent: 1 });

    return res.status(200).json({
      success: true,
      message: "Flats fetched successfully",
      count: flats.length,
      data: flats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Flat by ID
export const getFlatById = async (req, res) => {
  try {
    const { id } = req.params;

    const flat = await Flat.findById(id).populate("userId", "name phone city");

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flat fetched successfully",
      data: flat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Flat Listing
export const getMyFlatListing = async (req, res) => {
  try {
    const flat = await Flat.findOne({ userId: req.user._id }).populate(
      "userId",
      "name phone city",
    );

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "You don't have a flat listing yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flat listing fetched successfully",
      data: flat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Flat Listing
export const updateFlatListing = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      rent,
      bhk,
      furnished,
      deposit,
      availableFrom,
    } = req.body;

    const flat = await Flat.findOne({ userId: req.user._id });

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat listing not found",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (rent !== undefined) updateData.rent = rent;
    if (bhk) updateData.bhk = bhk;
    if (furnished) updateData.furnished = furnished;
    if (deposit !== undefined) updateData.deposit = deposit;
    if (availableFrom) updateData.availableFrom = availableFrom;

    const updatedFlat = await Flat.findByIdAndUpdate(flat._id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "name phone city");

    return res.status(200).json({
      success: true,
      message: "Flat listing updated successfully",
      data: updatedFlat,
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

// Delete Flat Listing
export const deleteFlatListing = async (req, res) => {
  try {
    const flat = await Flat.findOneAndDelete({ userId: req.user._id });

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flat listing deleted successfully",
      data: {
        deletedFlat: {
          id: flat._id,
          name: flat.name,
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
