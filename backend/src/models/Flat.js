import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
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
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    bhk: {
      type: String,
      enum: {
        values: ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"],
        message: "BHK must be 1RK, 1BHK, 2BHK, 3BHK, 4BHK, or 5BHK",
      },
      required: [true, "BHK type is required"],
    },
    furnished: {
      type: String,
      enum: {
        values: ["fully-furnished", "semi-furnished", "unfurnished"],
        message:
          "Furnished status must be fully-furnished, semi-furnished, or unfurnished",
      },
      required: [true, "Furnished status is required"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for efficient queries
flatSchema.index({ location: 1, bhk: 1 });
flatSchema.index({ rent: 1 });

// Prevent duplicate flat profiles for same user
flatSchema.index({ userId: 1 }, { unique: true });

const Flat = mongoose.model("Flat", flatSchema);

export default Flat;
