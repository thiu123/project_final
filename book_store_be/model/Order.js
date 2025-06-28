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
      },
    ],
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "Momo", "Vnpay"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
