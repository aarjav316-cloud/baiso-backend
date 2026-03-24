import Request from "../models/Request.js";

// Create Request
export const createRequest = async (req, res) => {
  try {
    const { maidId } = req.body;
    const userId = req.user._id;

    // Check if request already  exists
    const existingRequest = await Request.findOne({
      user: userId,
      maid: maidId,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You have  already requested this maid",
      });
    }

    const request = await Request.create({
      user: userId,
      maid: maidId,
    });

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating request",
      error: error.message,
    });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Request.find({ user: userId })
      .populate("maid")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
      error: error.message,
    });
  }
};
