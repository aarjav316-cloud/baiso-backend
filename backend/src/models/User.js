import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+?[\d\s-()]+$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "provider", "admin"],
        message: "Role must be user, provider, or admin",
      },
      default: "user",
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ["password", "otp"],
      default: "password",
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    savedItems: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        type: {
          type: String,
          enum: ["maid", "chef", "tiffin", "hostel", "flat"],
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    paymentMethods: {
      cards: [
        {
          cardNumber: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                return /^\d{16}$/.test(v);
              },
              message: "Card number must be 16 digits",
            },
          },
          expiry: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
              },
              message: "Expiry must be in MM/YY format",
            },
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      upi: [
        {
          upiId: {
            type: String,
            required: true,
            trim: true,
            validate: {
              validator: function (v) {
                return /^[\w.-]+@[\w.-]+$/.test(v);
              },
              message: "Invalid UPI ID format",
            },
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    addresses: [
      {
        label: {
          type: String,
          required: [true, "Address label is required"],
          trim: true,
          enum: {
            values: ["home", "work", "other"],
            message: "Label must be home, work, or other",
          },
        },
        addressLine: {
          type: String,
          required: [true, "Address line is required"],
          trim: true,
          minlength: [10, "Address must be at least 10 characters"],
          maxlength: [200, "Address cannot exceed 200 characters"],
        },
        city: {
          type: String,
          required: [true, "City is required"],
          trim: true,
        },
        state: {
          type: String,
          required: [true, "State is required"],
          trim: true,
        },
        pincode: {
          type: String,
          required: [true, "Pincode is required"],
          validate: {
            validator: function (v) {
              return /^\d{6}$/.test(v);
            },
            message: "Pincode must be 6 digits",
          },
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for better query performance (phone already indexed via unique: true)
UserSchema.index({ role: 1 });

const User = mongoose.model("User", UserSchema);

export default User;
