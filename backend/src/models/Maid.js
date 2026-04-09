import mongoose from "mongoose";

const maidSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    cookingType: {
      type: String,
      enum: ["veg", "non-veg"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    experience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
    },
    availability: {
      type: String,
      enum: ["morning", "evening", "both"],
      required: true,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
maidSchema.index({ location: 1 });
maidSchema.index({ price: 1 });

const Maid = mongoose.model("Maid", maidSchema);

export default Maid;
