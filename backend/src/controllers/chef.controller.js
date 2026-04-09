import Chef from "../models/Chef.js";
import User from "../models/User.js";

// Create Chef Profile
export const createChef = async (req, res) => {
  try {
    const { name, location, price, availability, experience, phone, cuisine } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !location ||
      !price ||
      !availability ||
      !experience ||
      !phone ||
      !cuisine
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already has a chef profile
    const existingChef = await Chef.findOne({ userId: req.user._id });
    if (existingChef) {
      return res.status(400).json({
        success: false,
        message: "You already have a chef profile",
      });
    }

    // Create chef profile with userId from authenticated user
    const chef = await Chef.create({
      userId: req.user._id,
      name,
      location,
      price,
      availability,
      experience,
      phone,
      cuisine,
    });

    // Update user role to "provider"
    await User.findByIdAndUpdate(req.user._id, { role: "provider" });

    return res.status(201).json({
      success: true,
      message: "Chef profile created successfully",
      data: chef,
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

// Get All Chefs with Filters
export const getAllChefs = async (req, res) => {
  try {
    const { location, cuisine, minPrice, maxPrice, availability } = req.query;

    let filter = {};

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Cuisine filter
    if (cuisine) {
      filter.cuisine = cuisine;
    }

    // Availability filter
    if (availability) {
      filter.availability = availability;
    }

    // Price range filter
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

    // Fetch chefs with filters and populate user info
    const chefs = await Chef.find(filter)
      .populate("userId", "name phone city")
      .sort({ price: 1 });

    return res.status(200).json({
      success: true,
      message: "Chefs fetched successfully",
      count: chefs.length,
      data: chefs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Chef by ID
export const getChefById = async (req, res) => {
  try {
    const { id } = req.params;

    const chef = await Chef.findById(id).populate("userId", "name phone city");

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chef fetched successfully",
      data: chef,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Chef Profile (for logged-in provider)
export const getMyChefProfile = async (req, res) => {
  try {
    const chef = await Chef.findOne({ userId: req.user._id }).populate(
      "userId",
      "name phone city",
    );

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "You don't have a chef profile yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chef profile fetched successfully",
      data: chef,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Chef Profile
export const updateChefProfile = async (req, res) => {
  try {
    const { name, location, price, availability, experience, phone, cuisine } =
      req.body;

    // Find chef profile by userId
    const chef = await Chef.findOne({ userId: req.user._id });

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef profile not found",
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (price !== undefined) updateData.price = price;
    if (availability) updateData.availability = availability;
    if (experience !== undefined) updateData.experience = experience;
    if (phone) updateData.phone = phone;
    if (cuisine) updateData.cuisine = cuisine;

    // Update chef profile
    const updatedChef = await Chef.findByIdAndUpdate(chef._id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "name phone city");

    return res.status(200).json({
      success: true,
      message: "Chef profile updated successfully",
      data: updatedChef,
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

// Delete Chef Profile
export const deleteChefProfile = async (req, res) => {
  try {
    const chef = await Chef.findOneAndDelete({ userId: req.user._id });

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef profile not found",
      });
    }

    // Update user role back to "user" if no other provider profiles exist
    // TODO: Check if user has maid profile before changing role
    await User.findByIdAndUpdate(req.user._id, { role: "user" });

    return res.status(200).json({
      success: true,
      message: "Chef profile deleted successfully",
      data: {
        deletedChef: {
          id: chef._id,
          name: chef.name,
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
