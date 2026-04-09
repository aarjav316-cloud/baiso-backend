import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Item ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["maid", "chef", "tiffin", "hostel", "flat"],
        message: "Type must be maid, chef, tiffin, hostel, or flat",
      },
      required: [true, "Service type is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index to prevent duplicate reviews (same user cannot review same item twice)
reviewSchema.index({ userId: 1, itemId: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ type: 1, itemId: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
