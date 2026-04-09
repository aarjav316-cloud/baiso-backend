import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";

// Search Services
export const searchServices = async (req, res) => {
  try {
    const { type, location, minPrice, maxPrice } = req.query;

    // Validate type parameter
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "type parameter is required",
      });
    }

    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Select the correct model based on type
    let Model;
    let priceField = "price"; // Default price field

    switch (type.toLowerCase()) {
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
        priceField = "rent"; // Hostel uses 'rent' instead of 'price'
        break;
      case "flat":
        Model = Flat;
        priceField = "rent"; // Flat uses 'rent' instead of 'price'
        break;
    }

    // Build query filters
    const filters = {};

    // Location filter (case-insensitive regex)
    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters[priceField] = {};

      if (minPrice) {
        const min = parseFloat(minPrice);
        if (isNaN(min)) {
          return res.status(400).json({
            success: false,
            message: "minPrice must be a valid number",
          });
        }
        filters[priceField].$gte = min;
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (isNaN(max)) {
          return res.status(400).json({
            success: false,
            message: "maxPrice must be a valid number",
          });
        }
        filters[priceField].$lte = max;
      }
    }

    // Execute optimized query with indexes
    const results = await Model.find(filters).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: "Search results fetched",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching services",
      error: error.message,
    });
  }
};
