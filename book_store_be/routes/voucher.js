const express = require("express");
const router = express.Router();
const {
  validateVoucher,
  applyVoucher,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} = require("../controllers/voucherController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../controllers/middlewareController");

// Validate voucher code
router.post("/validate", verifyToken, validateVoucher);

// Apply voucher (increment usage count)
router.post("/apply", verifyToken, applyVoucher);

// Get all vouchers
router.get("/all", getAllVouchers);

// Create voucher (admin only)
router.post("/", verifyTokenAndAdmin, createVoucher);

// Update voucher (admin only)
router.put("/:id", verifyTokenAndAdmin, updateVoucher);

// Delete voucher (admin only)
router.delete("/:id", verifyTokenAndAdmin, deleteVoucher);

module.exports = router;
