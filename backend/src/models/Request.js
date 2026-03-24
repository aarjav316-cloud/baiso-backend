import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    maid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maid",
      required: [true, "Maid is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Status must be pending, accepted, or rejected",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for better query performance
RequestSchema.index({ user: 1, maid: 1 });
RequestSchema.index({ status: 1 });

const Request = mongoose.model("Request", RequestSchema);

export default Request;
