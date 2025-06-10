const router = require("express").Router();
const cartsController = require("../controllers/carts/cartsController");
const middlewareController = require("../controllers/middlewareController");

router.get('/', middlewareController.verifyToken, cartsController.getCart)
router.post("/add", middlewareController.verifyToken, cartsController.addToCart)
router.put("/update", middlewareController.verifyToken, cartsController.updateItem)
router.delete("/delete", middlewareController.verifyToken, cartsController.removeItem)
router.delete("/deleteCart", middlewareController.verifyToken, cartsController.deleteCart)

module.exports = router;