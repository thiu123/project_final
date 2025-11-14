const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, required: true },
        productType: {
          type: String,
          enum: ["hardbook", "ebook"],
          default: "hardbook",
        },
      },
    ],
    total: { type: Number, required: true },
    voucher: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Momo", "Vnpay"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Confirmed",
        "In Delivery",
        "Delivered",
        "Cancelled",
        "Failed",
      ],
      default: "Pending",
    },
    confirmedByAdmin: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
