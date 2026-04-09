import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider ID is required"],
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Item ID is required"],
    },
    type: {
      type: String,
      enum: {
        values: ["maid", "chef", "tiffin", "hostel", "flat"],
        message: "Type must be maid, chef, tiffin, hostel, or flat",
      },
      required: [true, "Service type is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "cancelled", "completed"],
        message:
          "Status must be pending, accepted, rejected, cancelled, or completed",
      },
      default: "pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
