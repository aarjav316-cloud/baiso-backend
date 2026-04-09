import mongoose from "mongoose";

const tiffinSchema = new mongoose.Schema(
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
    foodType: {
      type: String,
      enum: {
        values: ["veg", "non-veg", "both"],
        message: "Food type must be veg, non-veg, or both",
      },
      required: [true, "Food type is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    mealType: {
      type: String,
      enum: {
        values: ["lunch", "dinner", "both"],
        message: "Meal type must be lunch, dinner, or both",
      },
      default: "both",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for efficient queries
tiffinSchema.index({ location: 1, foodType: 1 });
tiffinSchema.index({ price: 1 });

// Prevent duplicate tiffin profiles for same user
tiffinSchema.index({ userId: 1 }, { unique: true });

const Tiffin = mongoose.model("Tiffin", tiffinSchema);

export default Tiffin;
