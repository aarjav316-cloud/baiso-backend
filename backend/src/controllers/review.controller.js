import Review from "../models/Review.js";
import Maid from "../models/Maid.js";
import Chef from "../models/Chef.js";
import Tiffin from "../models/Tiffin.js";
import Hostel from "../models/Hostel.js";
import Flat from "../models/Flat.js";

// Add Review
export const addReview = async (req, res) => {
  try {
    const { itemId, type, rating, comment } = req.body;

    // Validate required fields
    if (!itemId || !type || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "itemId, type, rating, and comment are required",
      });
    }

    // Validate type
    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    // Validate comment length
    if (comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters",
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters",
      });
    }

    // Verify that the item exists
    let Model;
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
        break;
      case "flat":
        Model = Flat;
        break;
    }

    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      userId: req.user._id,
      itemId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this service",
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user._id,
      itemId,
      type: type.toLowerCase(),
      rating: ratingNum,
      comment: comment.trim(),
    });

    // Populate user details
    const populatedReview = await Review.findById(review._id).populate(
      "userId",
      "name city",
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: populatedReview,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this service",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};

// Get Reviews for a Service
export const getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;

    // Validate type
    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Verify that the item exists
    let Model;
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
        break;
      case "flat":
        Model = Flat;
        break;
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    // Get all reviews for this item
    const reviews = await Review.find({
      type: type.toLowerCase(),
      itemId: id,
    })
      .populate("userId", "name city")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        count: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate at least one field to update
    if (!rating && !comment) {
      return res.status(400).json({
        success: false,
        message: "Provide at least rating or comment to update",
      });
    }

    // Find review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Security: Only review owner can update
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own reviews",
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5",
        });
      }
      review.rating = ratingNum;
    }

    // Validate comment if provided
    if (comment !== undefined) {
      if (comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 10 characters",
        });
      }
      if (comment.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 500 characters",
        });
      }
      review.comment = comment.trim();
    }

    await review.save();

    // Populate user details
    const updatedReview = await Review.findById(id).populate(
      "userId",
      "name city",
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Security: Only review owner can delete
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own reviews",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        deletedReviewId: id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// Get User Reviews
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own reviews
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own reviews",
      });
    }

    // Get all reviews by this user
    const reviews = await Review.find({ userId })
      .populate("userId", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User reviews fetched successfully",
      data: {
        reviews,
        count: reviews.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user reviews",
      error: error.message,
    });
  }
};
