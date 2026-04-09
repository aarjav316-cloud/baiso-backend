import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";

// Get Filters by Type
export const getFiltersByType = async (req, res) => {
  try {
    const { type } = req.params;

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

    // Select the correct model and price field
    let Model;
    let priceField = "price";
    let filters = {};

    switch (type.toLowerCase()) {
      case "maid":
        Model = Maid;
        // Get distinct locations
        const maidLocations = await Model.distinct("location");

        // Get price range
        const maidPriceRange = await Model.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]);

        // Get distinct availability options
        const maidAvailability = await Model.distinct("availability");

        // Get distinct cooking types
        const maidCookingTypes = await Model.distinct("cookingType");

        filters = {
          locations: maidLocations.sort(),
          priceRange: {
            min: maidPriceRange[0]?.minPrice || 0,
            max: maidPriceRange[0]?.maxPrice || 0,
          },
          availability: maidAvailability.sort(),
          cookingType: maidCookingTypes.sort(),
        };
        break;

      case "chef":
        Model = Chef;
        // Get distinct locations
        const chefLocations = await Model.distinct("location");

        // Get price range
        const chefPriceRange = await Model.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]);

        // Get distinct cuisine options
        const chefCuisines = await Model.distinct("cuisine");

        // Get distinct availability options
        const chefAvailability = await Model.distinct("availability");

        filters = {
          locations: chefLocations.sort(),
          priceRange: {
            min: chefPriceRange[0]?.minPrice || 0,
            max: chefPriceRange[0]?.maxPrice || 0,
          },
          cuisine: chefCuisines.sort(),
          availability: chefAvailability.sort(),
        };
        break;

      case "tiffin":
        Model = Tiffin;
        // Get distinct locations
        const tiffinLocations = await Model.distinct("location");

        // Get price range
        const tiffinPriceRange = await Model.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]);

        // Get distinct food types
        const tiffinFoodTypes = await Model.distinct("foodType");

        // Get distinct meal types
        const tiffinMealTypes = await Model.distinct("mealType");

        filters = {
          locations: tiffinLocations.sort(),
          priceRange: {
            min: tiffinPriceRange[0]?.minPrice || 0,
            max: tiffinPriceRange[0]?.maxPrice || 0,
          },
          foodType: tiffinFoodTypes.sort(),
          mealType: tiffinMealTypes.sort(),
          deliveryAvailable: [true, false],
        };
        break;

      case "hostel":
        Model = Hostel;
        priceField = "rent";

        // Get distinct locations
        const hostelLocations = await Model.distinct("location");

        // Get rent range
        const hostelRentRange = await Model.aggregate([
          {
            $group: {
              _id: null,
              minRent: { $min: "$rent" },
              maxRent: { $max: "$rent" },
            },
          },
        ]);

        // Get distinct gender options
        const hostelGenders = await Model.distinct("gender");

        // Get all unique amenities (flatten arrays)
        const hostelAmenities = await Model.aggregate([
          { $unwind: "$amenities" },
          { $group: { _id: "$amenities" } },
          { $sort: { _id: 1 } },
        ]);

        filters = {
          locations: hostelLocations.sort(),
          rentRange: {
            min: hostelRentRange[0]?.minRent || 0,
            max: hostelRentRange[0]?.maxRent || 0,
          },
          gender: hostelGenders.sort(),
          amenities: hostelAmenities.map((a) => a._id).filter(Boolean),
          foodIncluded: [true, false],
        };
        break;

      case "flat":
        Model = Flat;
        priceField = "rent";

        // Get distinct locations
        const flatLocations = await Model.distinct("location");

        // Get rent range
        const flatRentRange = await Model.aggregate([
          {
            $group: {
              _id: null,
              minRent: { $min: "$rent" },
              maxRent: { $max: "$rent" },
            },
          },
        ]);

        // Get distinct BHK types
        const flatBHKs = await Model.distinct("bhk");

        // Get distinct furnished status
        const flatFurnished = await Model.distinct("furnished");

        filters = {
          locations: flatLocations.sort(),
          rentRange: {
            min: flatRentRange[0]?.minRent || 0,
            max: flatRentRange[0]?.maxRent || 0,
          },
          bhk: flatBHKs.sort(),
          furnished: flatFurnished.sort(),
        };
        break;
    }

    return res.status(200).json({
      success: true,
      message: "Filters fetched successfully",
      data: {
        filters,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching filters",
      error: error.message,
    });
  }
};
