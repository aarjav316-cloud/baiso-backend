import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
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
    roomsAvailable: {
      type: Number,
      required: [true, "Number of rooms available is required"],
      min: [0, "Rooms available cannot be negative"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "co-ed"],
        message: "Gender must be male, female, or co-ed",
      },
      default: "co-ed",
    },
    foodIncluded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for efficient queries
hostelSchema.index({ location: 1, gender: 1 });
hostelSchema.index({ rent: 1 });

// Prevent duplicate hostel profiles for same user
hostelSchema.index({ userId: 1 }, { unique: true });

const Hostel = mongoose.model("Hostel", hostelSchema);

export default Hostel;
