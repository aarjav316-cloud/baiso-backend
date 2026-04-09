import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { otpService } from "../services/otp.service.js";

// Helper: Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" },
  );
};

// Helper: Create user response
const createUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    city: user.city,
    role: user.role,
    isPhoneVerified: user.isPhoneVerified,
    authMethod: user.authMethod,
  };
};

// Unified Login/Register API
export const unifiedAuth = async (req, res) => {
  try {
    const { phone, password, otp, name, city } = req.body;

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone }).select("+password");

    // CASE 1: User exists - LOGIN FLOW
    if (existingUser) {
      // Password-based login
      if (password) {
        if (!existingUser.password) {
          return res.status(400).json({
            success: false,
            message:
              "This account uses OTP authentication. Please use OTP to login.",
          });
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          existingUser.password,
        );

        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        const token = generateToken(existingUser._id, existingUser.role);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            token,
            user: createUserResponse(existingUser),
          },
        });
      }

      // OTP-based login
      if (otp) {
        // Verify OTP from Redis
        const otpVerification = await otpService.verifyOTP(phone, otp);

        if (!otpVerification.valid) {
          return res.status(401).json({
            success: false,
            message: otpVerification.reason || "Invalid or expired OTP",
          });
        }

        // Mark phone as verified
        existingUser.isPhoneVerified = true;
        await existingUser.save();

        const token = generateToken(existingUser._id, existingUser.role);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            token,
            user: createUserResponse(existingUser),
          },
        });
      }

      // No password or OTP provided
      return res.status(400).json({
        success: false,
        message: "Please provide either password or OTP",
      });
    }

    // CASE 2: User does not exist - REGISTER FLOW
    // For registration with OTP, verify OTP first
    if (otp) {
      const otpVerification = await otpService.verifyOTP(phone, otp);

      if (!otpVerification.valid) {
        return res.status(401).json({
          success: false,
          message: otpVerification.reason || "Invalid or expired OTP",
        });
      }

      // OTP verified, proceed with registration
      if (!name || !city) {
        return res.status(400).json({
          success: false,
          message: "Name and city are required for registration",
        });
      }

      const newUser = await User.create({
        name,
        phone,
        city,
        authMethod: "otp",
        isPhoneVerified: true,
      });

      const token = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          token,
          user: createUserResponse(newUser),
        },
      });
    }

    // Registration with password
    if (password) {
      if (!name || !city) {
        return res.status(400).json({
          success: false,
          message: "Name and city are required for registration",
          hint: "This phone number is not registered. Please provide name and city to create an account.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        phone,
        password: hashedPassword,
        city,
        authMethod: "password",
        isPhoneVerified: true,
      });

      const token = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          token,
          user: createUserResponse(newUser),
        },
      });
    }

    // No credentials provided
    return res.status(400).json({
      success: false,
      message: "Please provide password or OTP for authentication",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

// Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check rate limiting
    const canRequest = await otpService.canRequestOTP(phone);
    if (!canRequest.allowed) {
      return res.status(429).json({
        success: false,
        message: canRequest.reason,
        data: {
          retryAfter: canRequest.retryAfter,
        },
      });
    }

    // Generate OTP
    const otp = otpService.generateOTP();

    // Store OTP in Redis
    const otpData = await otpService.storeOTP(phone, otp);

    // TODO: Send OTP via SMS service (Twilio, AWS SNS, etc.)
    console.log(`OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phone,
        expiresIn: otpData.expiresIn,
        // Only expose OTP in development
        ...(process.env.NODE_ENV === "development" && { otp }),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// GET Profile API - Fetch user profile by userId
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Optional: Restrict users to only fetch their own profile
    // Uncomment the following lines to enable this restriction
    // if (req.user._id.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Unauthorized. You can only view your own profile",
    //   });
    // }

    // Find user by ID (exclude sensitive fields)
    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: createUserResponse(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// UPDATE Profile API - Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, city } = req.body;

    // Validate input - at least one field must be provided
    if (!name && !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update (name or city)",
      });
    }

    // Validate name if provided
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    // Validate city if provided
    if (city && city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "City must be at least 2 characters",
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (city) updateData.city = city.trim();

    // Update user (req.user comes from auth middleware)
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run model validators
    }).select("-password -otp -otpExpiry");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: createUserResponse(updatedUser),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// DELETE Account API - Delete logged-in user's account
export const deleteAccount = async (req, res) => {
  try {
    // Delete user (req.user comes from auth middleware)
    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional: Clean up related data
    // TODO: Delete user's requests, bookings, etc.
    // await Request.deleteMany({ user: req.user._id });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: {
        deletedUser: {
          id: deletedUser._id,
          name: deletedUser.name,
          phone: deletedUser.phone,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

// GET Provider Data - Fetch all provider services for a user
export const getProviderData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Only allow users to fetch their own data
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only view your own provider data",
      });
    }

    // Import models dynamically to avoid circular dependencies
    const Maid = (await import("../models/Maid.js")).default;
    const Chef = (await import("../models/Chef.js")).default;
    const Tiffin = (await import("../models/Tiffin.js")).default;
    const Hostel = (await import("../models/Hostel.js")).default;
    const Flat = (await import("../models/Flat.js")).default;

    // Fetch all provider data in parallel for efficiency
    const [maids, chefs, tiffins, hostels, flats] = await Promise.all([
      Maid.find({ userId }).lean(),
      Chef.find({ userId }).lean(),
      Tiffin.find({ userId }).lean(),
      Hostel.find({ userId }).lean(),
      Flat.find({ userId }).lean(),
    ]);

    // Calculate total count
    const totalServices =
      maids.length +
      chefs.length +
      tiffins.length +
      hostels.length +
      flats.length;

    return res.status(200).json({
      success: true,
      message: "Provider data fetched successfully",
      data: {
        maids,
        chefs,
        tiffins,
        hostels,
        flats,
        summary: {
          totalServices,
          maidsCount: maids.length,
          chefsCount: chefs.length,
          tiffinsCount: tiffins.length,
          hostelsCount: hostels.length,
          flatsCount: flats.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching provider data",
      error: error.message,
    });
  }
};

// GET Wallet Balance
export const getWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own wallet
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own wallet",
      });
    }

    // Get user's wallet balance
    const user = await User.findById(userId).select("name phone walletBalance");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching wallet balance",
      error: error.message,
    });
  }
};

// Add Money to Wallet
export const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const amountValue = Number(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number greater than 0",
      });
    }

    // Get current user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add amount to wallet
    user.walletBalance = (user.walletBalance || 0) + amountValue;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${amountValue} added to wallet successfully`,
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        previousBalance: (user.walletBalance || 0) - amountValue,
        amountAdded: amountValue,
        currentBalance: user.walletBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding money to wallet",
      error: error.message,
    });
  }
};

// GET Saved Items
export const getSavedItems = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own saved items
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own saved items",
      });
    }

    // Get user's saved items
    const user = await User.findById(userId).select("name savedItems");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved items fetched successfully",
      data: {
        userId: user._id,
        savedItems: user.savedItems || [],
        count: user.savedItems?.length || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching saved items",
      error: error.message,
    });
  }
};

// Add Item to Saved
export const addSavedItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;

    // Validate required fields
    if (!itemId || !type) {
      return res.status(400).json({
        success: false,
        message: "itemId and type are required",
      });
    }

    // Validate type
    const validTypes = ["maid", "chef", "tiffin", "hostel", "flat"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Get user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if item already saved (prevent duplicates)
    const alreadySaved = user.savedItems?.some(
      (item) => item.itemId.toString() === itemId && item.type === type,
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: "Item already saved",
      });
    }

    // Add item to saved items
    if (!user.savedItems) {
      user.savedItems = [];
    }

    user.savedItems.push({
      itemId,
      type,
      savedAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item saved successfully",
      data: {
        savedItem: {
          itemId,
          type,
          savedAt: new Date(),
        },
        totalSaved: user.savedItems.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving item",
      error: error.message,
    });
  }
};

// Remove Item from Saved
export const removeSavedItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;

    // Validate required fields
    if (!itemId || !type) {
      return res.status(400).json({
        success: false,
        message: "itemId and type are required",
      });
    }

    // Get user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if item exists in saved items
    const itemIndex = user.savedItems?.findIndex(
      (item) => item.itemId.toString() === itemId && item.type === type,
    );

    if (itemIndex === -1 || itemIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: "Item not found in saved items",
      });
    }

    // Remove item from saved items
    user.savedItems.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from saved successfully",
      data: {
        removedItem: {
          itemId,
          type,
        },
        totalSaved: user.savedItems.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing saved item",
      error: error.message,
    });
  }
};
