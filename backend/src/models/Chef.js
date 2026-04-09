import mongoose from "mongoose";

const chefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      index: true,
    },
    cuisine: {
      type: String,
      enum: {
        values: [
          "indian",
          "chinese",
          "italian",
          "continental",
          "multi-cuisine",
        ],
        message:
          "Cuisine must be indian, chinese, italian, continental, or multi-cuisine",
      },
      required: [true, "Cuisine type is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    availability: {
      type: String,
      enum: {
        values: ["morning", "evening", "both", "full-time"],
        message: "Availability must be morning, evening, both, or full-time",
      },
      required: [true, "Availability is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for efficient queries
chefSchema.index({ location: 1, cuisine: 1 });
chefSchema.index({ price: 1 });

// Prevent duplicate chef profiles for same user
chefSchema.index({ userId: 1 }, { unique: true });

const Chef = mongoose.model("Chef", chefSchema);

export default Chef;
