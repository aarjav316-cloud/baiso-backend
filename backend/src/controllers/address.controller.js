import User from "../models/User.js";

// Get User Addresses
export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own addresses
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own addresses",
      });
    }

    // Find user and get addresses
    const user = await User.findById(userId).select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: {
        addresses: user.addresses || [],
        count: user.addresses?.length || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching addresses",
      error: error.message,
    });
  }
};

// Add Address
export const addAddress = async (req, res) => {
  try {
    const { label, addressLine, city, state, pincode } = req.body;

    // Validate required fields
    if (!label || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: label, addressLine, city, state, pincode",
      });
    }

    // Validate label
    const validLabels = ["home", "work", "other"];
    if (!validLabels.includes(label.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid label. Must be one of: ${validLabels.join(", ")}`,
      });
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be 6 digits",
      });
    }

    // Validate address line length
    if (addressLine.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Address must be at least 10 characters",
      });
    }

    if (addressLine.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 200 characters",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize addresses array if not exists
    if (!user.addresses) {
      user.addresses = [];
    }

    // Check if this is the first address
    const isFirstAddress = user.addresses.length === 0;

    // Create new address
    const newAddress = {
      label: label.toLowerCase(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: isFirstAddress, // First address is default
      addedAt: new Date(),
    };

    // Add address to array
    user.addresses.push(newAddress);
    await user.save();

    // Get the added address (last item in array)
    const addedAddress = user.addresses[user.addresses.length - 1];

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: addedAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding address",
      error: error.message,
    });
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, addressLine, city, state, pincode } = req.body;

    // Validate at least one field to update
    if (!label && !addressLine && !city && !state && !pincode) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find address by id
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update fields if provided
    if (label !== undefined) {
      const validLabels = ["home", "work", "other"];
      if (!validLabels.includes(label.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid label. Must be one of: ${validLabels.join(", ")}`,
        });
      }
      address.label = label.toLowerCase();
    }

    if (addressLine !== undefined) {
      if (addressLine.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Address must be at least 10 characters",
        });
      }
      if (addressLine.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Address cannot exceed 200 characters",
        });
      }
      address.addressLine = addressLine.trim();
    }

    if (city !== undefined) {
      address.city = city.trim();
    }

    if (state !== undefined) {
      address.state = state.trim();
    }

    if (pincode !== undefined) {
      if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: "Pincode must be 6 digits",
        });
      }
      address.pincode = pincode.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message,
    });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find address by id
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Check if this is the default address
    const wasDefault = address.isDefault;

    // Remove address
    address.deleteOne();

    // If deleted address was default and there are other addresses, set first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: {
        deletedAddressId: id,
        remainingAddresses: user.addresses.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting address",
      error: error.message,
    });
  }
};

// Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find address by id
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Set all addresses to non-default
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set selected address as default
    address.isDefault = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error setting default address",
      error: error.message,
    });
  }
};
