import User from "../models/User.js";

// Get Payment Methods
export const getPaymentMethods = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: Ensure user can only access their own payment methods
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only access your own payment methods",
      });
    }

    // Find user and get payment methods
    const user = await User.findById(userId).select("paymentMethods");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize payment methods if not exists
    const paymentMethods = user.paymentMethods || { cards: [], upi: [] };

    // Mask card numbers for security (show only last 4 digits)
    const maskedCards = paymentMethods.cards.map((card) => ({
      _id: card._id,
      cardNumber: `****${card.cardNumber.slice(-4)}`,
      expiry: card.expiry,
      name: card.name,
      addedAt: card.addedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Payment methods fetched successfully",
      data: {
        cards: maskedCards,
        upi: paymentMethods.upi,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payment methods",
      error: error.message,
    });
  }
};

// Add Card
export const addCard = async (req, res) => {
  try {
    const { cardNumber, expiry, name } = req.body;

    // Validate required fields
    if (!cardNumber || !expiry || !name) {
      return res.status(400).json({
        success: false,
        message: "cardNumber, expiry, and name are required",
      });
    }

    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: "Card number must be 16 digits",
      });
    }

    // Validate expiry format
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return res.status(400).json({
        success: false,
        message: "Expiry must be in MM/YY format",
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

    // Initialize payment methods if not exists
    if (!user.paymentMethods) {
      user.paymentMethods = { cards: [], upi: [] };
    }

    // Check for duplicate card
    const cardExists = user.paymentMethods.cards.some(
      (card) => card.cardNumber === cardNumber,
    );

    if (cardExists) {
      return res.status(400).json({
        success: false,
        message: "Card already exists",
      });
    }

    // Add card
    user.paymentMethods.cards.push({
      cardNumber,
      expiry,
      name,
      addedAt: new Date(),
    });

    await user.save();

    // Return masked card number
    const addedCard =
      user.paymentMethods.cards[user.paymentMethods.cards.length - 1];

    return res.status(201).json({
      success: true,
      message: "Card added successfully",
      data: {
        _id: addedCard._id,
        cardNumber: `****${cardNumber.slice(-4)}`,
        expiry: addedCard.expiry,
        name: addedCard.name,
        addedAt: addedCard.addedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding card",
      error: error.message,
    });
  }
};

// Remove Card
export const removeCard = async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: "cardId is required",
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

    // Check if payment methods exist
    if (!user.paymentMethods || !user.paymentMethods.cards) {
      return res.status(404).json({
        success: false,
        message: "No cards found",
      });
    }

    // Find card index
    const cardIndex = user.paymentMethods.cards.findIndex(
      (card) => card._id.toString() === cardId,
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Remove card
    user.paymentMethods.cards.splice(cardIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Card removed successfully",
      data: {
        remainingCards: user.paymentMethods.cards.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing card",
      error: error.message,
    });
  }
};

// Add UPI
export const addUPI = async (req, res) => {
  try {
    const { upiId } = req.body;

    // Validate required field
    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: "upiId is required",
      });
    }

    // Validate UPI ID format
    if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UPI ID format",
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

    // Initialize payment methods if not exists
    if (!user.paymentMethods) {
      user.paymentMethods = { cards: [], upi: [] };
    }

    // Check for duplicate UPI
    const upiExists = user.paymentMethods.upi.some(
      (upi) => upi.upiId === upiId,
    );

    if (upiExists) {
      return res.status(400).json({
        success: false,
        message: "UPI ID already exists",
      });
    }

    // Add UPI
    user.paymentMethods.upi.push({
      upiId,
      addedAt: new Date(),
    });

    await user.save();

    const addedUPI =
      user.paymentMethods.upi[user.paymentMethods.upi.length - 1];

    return res.status(201).json({
      success: true,
      message: "UPI added successfully",
      data: {
        _id: addedUPI._id,
        upiId: addedUPI.upiId,
        addedAt: addedUPI.addedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding UPI",
      error: error.message,
    });
  }
};

// Remove UPI
export const removeUPI = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: "upiId is required",
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

    // Check if payment methods exist
    if (!user.paymentMethods || !user.paymentMethods.upi) {
      return res.status(404).json({
        success: false,
        message: "No UPI IDs found",
      });
    }

    // Find UPI index
    const upiIndex = user.paymentMethods.upi.findIndex(
      (upi) => upi.upiId === upiId || upi._id.toString() === upiId,
    );

    if (upiIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "UPI ID not found",
      });
    }

    // Remove UPI
    user.paymentMethods.upi.splice(upiIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "UPI removed successfully",
      data: {
        remainingUPIs: user.paymentMethods.upi.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing UPI",
      error: error.message,
    });
  }
};
