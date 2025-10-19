const express = require("express");
const router = express.Router();
const {
  validateVoucher,
  applyVoucher,
  getAllVouchers,
  createVoucher,
} = require("../controllers/voucherController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../controllers/middlewareController");

// Validate voucher code
router.post("/validate", verifyToken, validateVoucher);

// Apply voucher (increment usage count)
router.post("/apply", verifyToken, applyVoucher);

// Get all active vouchers
router.get("/", verifyToken, getAllVouchers);

// Create voucher (admin only)
router.post("/create", verifyTokenAndAdmin, createVoucher);

module.exports = router;
