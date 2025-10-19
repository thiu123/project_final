const mongoose = require("mongoose");

/**
 * Voucher Schema
 *
 * Dùng để lưu trữ thông tin mã giảm giá (voucher) trong hệ thống.
 * Hỗ trợ 2 loại giảm giá: theo phần trăm (%) hoặc theo giá trị cố định (VNĐ).
 */
const voucherSchema = new mongoose.Schema(
  {
    // Mã voucher, phải là duy nhất (ví dụ: "BOOKSALE10")
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Tự động chuyển thành chữ hoa
      trim: true, // Loại bỏ khoảng trắng ở đầu/cuối
    },

    // Loại giảm giá: percentage (theo %) hoặc fixed (số tiền cố định)
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    // Giá trị giảm (ví dụ: 10 nghĩa là 10% hoặc 10.000đ tùy theo discountType)
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Giá trị đơn hàng tối thiểu để áp dụng voucher (mặc định 0 là không giới hạn)
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Giảm tối đa bao nhiêu tiền (chỉ áp dụng cho loại percentage)
    maxDiscount: {
      type: Number,
      default: null, // null nghĩa là không giới hạn
    },

    // Ngày hết hạn của voucher
    expiryDate: {
      type: Date,
      required: true,
    },

    // Trạng thái voucher (còn hoạt động hay không)
    isActive: {
      type: Boolean,
      default: true,
    },

    // Giới hạn số lần sử dụng tổng cộng (null = không giới hạn)
    usageLimit: {
      type: Number,
      default: null,
    },

    // Đếm số lần voucher đã được sử dụng
    usedCount: {
      type: Number,
      default: 0,
    },

    // Mô tả ngắn gọn cho voucher (hiển thị cho admin hoặc user)
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Xuất model để dùng trong các file khác
module.exports = mongoose.model("Voucher", voucherSchema);
