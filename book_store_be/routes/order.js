const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order/orderController');
const middlewareController = require("../controllers/middlewareController");

router.post("/checkout", middlewareController.verifyToken, orderController.createOrderFromCart);
router.get("/preview", middlewareController.verifyToken, orderController.getCartPreview);
router.get("/vnpay_return", orderController.vnpayReturn);
router.get("/:id", orderController.getOrderById);

module.exports = router;