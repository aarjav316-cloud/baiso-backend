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
    const maids = await Maid.find();

    return res.status(200).json({
      success: true,
      message: "maids fetched successfully",
      data: maids,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



