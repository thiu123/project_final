const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order/orderController");
const middlewareController = require("../controllers/middlewareController");

router.post(
  "/checkout",
  middlewareController.verifyToken,
  orderController.createOrderFromCart
);
router.post(
  "/checkout_momo",
  middlewareController.verifyToken,
  orderController.createMoMoOrderFromCart
);
router.get(
  "/preview",
  middlewareController.verifyToken,
  orderController.getCartPreview
);
router.get(
  "/user",
  middlewareController.verifyToken,
  orderController.getUserOrders
);
router.get(
  "/check-ebook",
  middlewareController.verifyToken,
  orderController.checkEbookPurchase
);
router.get("/vnpay_return", orderController.vnpayReturn);
router.get("/momo_return", orderController.momoReturn);
router.get("/:id", orderController.getOrderById);

module.exports = router;
