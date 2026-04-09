import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";

// Get All Listings from All Provider Types
export const getAllListings = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, limit } = req.query;

    // Build filter object for common fields
    const filter = {};

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Price/Rent filter
    const priceFilter = {};
    if (minPrice) {
      const min = Number(minPrice);
      if (isNaN(min) || min < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid minPrice value",
        });
      }
      priceFilter.$gte = min;
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (isNaN(max) || max < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid maxPrice value",
        });
      }
      priceFilter.$lte = max;
    }

    // Limit per type (default: 10, max: 50)
    const limitPerType = limit ? Math.min(Number(limit), 50) : 10;

    // Build queries for each provider type
    const maidQuery = Maid.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitPerType)
      .lean();

    const chefQuery = Chef.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitPerType)
      .populate("userId", "name phone city")
      .lean();

    const tiffinQuery = Tiffin.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitPerType)
      .populate("userId", "name phone city")
      .lean();

    const hostelQuery = Hostel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitPerType)
      .populate("userId", "name phone city")
      .lean();

    const flatQuery = Flat.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitPerType)
      .populate("userId", "name phone city")
      .lean();

    // Add price filter for models that have price field
    if (Object.keys(priceFilter).length > 0) {
      maidQuery.where("price").gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) maidQuery.where("price").lte(priceFilter.$lte);

      chefQuery.where("price").gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) chefQuery.where("price").lte(priceFilter.$lte);

      tiffinQuery.where("price").gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) tiffinQuery.where("price").lte(priceFilter.$lte);

      hostelQuery.where("rent").gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) hostelQuery.where("rent").lte(priceFilter.$lte);

      flatQuery.where("rent").gte(priceFilter.$gte || 0);
      if (priceFilter.$lte) flatQuery.where("rent").lte(priceFilter.$lte);
    }

    // Execute all queries in parallel
    const [maids, chefs, tiffins, hostels, flats] = await Promise.all([
      maidQuery,
      chefQuery,
      tiffinQuery,
      hostelQuery,
      flatQuery,
    ]);

    // Calculate total count
    const totalListings =
      maids.length +
      chefs.length +
      tiffins.length +
      hostels.length +
      flats.length;

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: {
        maids,
        chefs,
        tiffins,
        hostels,
        flats,
        summary: {
          totalListings,
          maidsCount: maids.length,
          chefsCount: chefs.length,
          tiffinsCount: tiffins.length,
          hostelsCount: hostels.length,
          flatsCount: flats.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching listings",
      error: error.message,
    });
  }
};

// Update Listing by Type and User ID
export const updateListing = async (req, res) => {
  try {
    const { type, userId } = req.params;

    // Security: Ensure authenticated user can only update their own listings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own listings",
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

    // Get the appropriate model based on type
    let Model;
    switch (type) {
      case "maid":
        Model = Maid;
        break;
      case "chef":
        Model = Chef;
        break;
      case "tiffin":
        Model = Tiffin;
        break;
      case "hostel":
        Model = Hostel;
        break;
      case "flat":
        Model = Flat;
        break;
    }

    // For Maid model (doesn't have userId field), we need different logic
    if (type === "maid") {
      return res.status(400).json({
        success: false,
        message:
          "Maid listings cannot be updated through this endpoint. Maid model does not have userId reference.",
      });
    }

    // Find the listing by userId
    const listing = await Model.findOne({ userId });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: `No ${type} listing found for this user`,
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    const allowedFields = Object.keys(req.body);

    // Filter out fields that shouldn't be updated
    const restrictedFields = ["userId", "_id", "createdAt", "updatedAt"];

    allowedFields.forEach((field) => {
      if (!restrictedFields.includes(field) && req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update the listing
    const updatedListing = await Model.findByIdAndUpdate(
      listing._id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "name phone city");

    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} listing updated successfully`,
      data: updatedListing,
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
      message: "Error updating listing",
      error: error.message,
    });
  }
};
