const Voucher = require("../model/Voucher");

// Validate and get voucher details
const validateVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    console.log("=== Validate Voucher Request ===");
    console.log("Code:", code);
    console.log("Order Amount:", orderAmount);

    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Voucher code and order amount are required",
      });
    }

    // Find voucher by code
    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    console.log("Voucher found:", voucher);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid voucher code",
      });
    }

    // Check if voucher has expired
    if (new Date() > voucher.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "This voucher has expired",
      });
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This voucher has reached its usage limit",
      });
    }

    // Check minimum order amount
    if (orderAmount < voucher.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${voucher.minOrderAmount}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (orderAmount * voucher.discountValue) / 100;
      // Apply max discount if specified
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = voucher.discountValue;
    }

    // Don't allow discount to exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    res.status(200).json({
      success: true,
      data: {
        voucher: {
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          description: voucher.description,
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((orderAmount - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Validate voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating voucher",
      error: error.message,
    });
  }
};

// Apply voucher (increment usage count)
const applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Voucher code is required",
      });
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid voucher code",
      });
    }

    await voucher.save();

    res.status(200).json({
      success: true,
      message: "Voucher applied successfully",
    });
  } catch (error) {
    console.error("Apply voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Error applying voucher",
      error: error.message,
    });
  }
};

// Get all active vouchers (for display/admin)
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Get vouchers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vouchers",
      error: error.message,
    });
  }
};

// Update voucher (admin only)
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const voucher = await Voucher.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    console.error("Update voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating voucher",
      error: error.message,
    });
  }
};

// Delete voucher (admin only)
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByIdAndDelete(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    console.error("Delete voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting voucher",
      error: error.message,
    });
  }
};

// Create voucher (admin only)
const createVoucher = async (req, res) => {
  try {
    const voucherData = req.body;

    // Check if voucher code already exists
    const existingVoucher = await Voucher.findOne({
      code: voucherData.code.toUpperCase(),
    });

    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: "Voucher code already exists",
      });
    }

    const voucher = new Voucher(voucherData);
    await voucher.save();

    res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: voucher,
    });
  } catch (error) {
    console.error("Create voucher error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating voucher",
      error: error.message,
    });
  }
};

module.exports = {
  validateVoucher,
  applyVoucher,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
};
