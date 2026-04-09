import Tiffin from "../models/Tiffin.js";
import User from "../models/User.js";

// Create Tiffin Service
export const createTiffin = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      foodType,
      price,
      deliveryAvailable,
      mealType,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !location || !foodType || !price) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided (name, phone, location, foodType, price)",
      });
    }

    // Check if user already has a tiffin service
    const existingTiffin = await Tiffin.findOne({ userId: req.user._id });
    if (existingTiffin) {
      return res.status(400).json({
        success: false,
        message: "You already have a tiffin service",
      });
    }

    // Create tiffin service with userId from authenticated user
    const tiffin = await Tiffin.create({
      userId: req.user._id,
      name,
      phone,
      location,
      foodType,
      price,
      deliveryAvailable: deliveryAvailable || false,
      mealType: mealType || "both",
    });

    // Update user role to "provider"
    await User.findByIdAndUpdate(req.user._id, { role: "provider" });

    return res.status(201).json({
      success: true,
      message: "Tiffin service created successfully",
      data: tiffin,
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

// Get All Tiffin Services with Filters
export const getAllTiffins = async (req, res) => {
  try {
    const {
      location,
      foodType,
      minPrice,
      maxPrice,
      deliveryAvailable,
      mealType,
    } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (foodType) {
      filter.foodType = foodType;
    }

    if (mealType) {
      filter.mealType = mealType;
    }

    if (deliveryAvailable !== undefined) {
      filter.deliveryAvailable = deliveryAvailable === "true";
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        const min = Number(minPrice);
        if (isNaN(min) || min < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minPrice value",
          });
        }
        filter.price.$gte = min;
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (isNaN(max) || max < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maxPrice value",
          });
        }
        filter.price.$lte = max;
      }
    }

    const tiffins = await Tiffin.find(filter)
      .populate("userId", "name phone city")
      .sort({ price: 1 });

    return res.status(200).json({
      success: true,
      message: "Tiffin services fetched successfully",
      count: tiffins.length,
      data: tiffins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Tiffin by ID
export const getTiffinById = async (req, res) => {
  try {
    const { id } = req.params;

    const tiffin = await Tiffin.findById(id).populate(
      "userId",
      "name phone city",
    );

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: "Tiffin service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tiffin service fetched successfully",
      data: tiffin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Tiffin Service
export const getMyTiffinService = async (req, res) => {
  try {
    const tiffin = await Tiffin.findOne({ userId: req.user._id }).populate(
      "userId",
      "name phone city",
    );

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: "You don't have a tiffin service yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tiffin service fetched successfully",
      data: tiffin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Tiffin Service
export const updateTiffinService = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      foodType,
      price,
      deliveryAvailable,
      mealType,
    } = req.body;

    const tiffin = await Tiffin.findOne({ userId: req.user._id });

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: "Tiffin service not found",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (foodType) updateData.foodType = foodType;
    if (price !== undefined) updateData.price = price;
    if (deliveryAvailable !== undefined)
      updateData.deliveryAvailable = deliveryAvailable;
    if (mealType) updateData.mealType = mealType;

    const updatedTiffin = await Tiffin.findByIdAndUpdate(
      tiffin._id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "name phone city");

    return res.status(200).json({
      success: true,
      message: "Tiffin service updated successfully",
      data: updatedTiffin,
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

// Delete Tiffin Service
export const deleteTiffinService = async (req, res) => {
  try {
    const tiffin = await Tiffin.findOneAndDelete({ userId: req.user._id });

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: "Tiffin service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tiffin service deleted successfully",
      data: {
        deletedTiffin: {
          id: tiffin._id,
          name: tiffin.name,
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
