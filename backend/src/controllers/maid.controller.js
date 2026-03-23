import Maid from "../models/Maid.js";

export const createMaid = async (req, res) => {
  try {
    const {
      name,
      location,
      price,
      availability,
      experience,
      phone,
      cookingType,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !location ||
      !price ||
      !availability ||
      !experience ||
      !phone ||
      !cookingType
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const maid = await Maid.create({
      name,
      location,
      price,
      availability,
      experience,
      phone,
      cookingType,
    });

    return res.status(201).json({
      success: true,
      message: "maid created successfully",
      data: maid,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMaids = async (req, res) => {
  try {
    const { location, cookingType, minPrice, maxPrice, availability } =
      req.query;

    let filter = {};

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (cookingType) {
      filter.cookingType = cookingType;
    }

    if (availability) {
      filter.availability = availability;
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

    const maids = await Maid.find(filter).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      message: "maids fetched successfully",
      count: maids.length,
      data: maids,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
