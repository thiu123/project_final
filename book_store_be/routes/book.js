const router = require("express").Router();
const bookController = require("../controllers/books/bookController");
const middlewareController = require("../controllers/middlewareController");

router.get("/", bookController.getAllBooks);
router.get("/subject/:subject", bookController.getBooksBySubject);
router.get("/:id", bookController.getBookById);

router.post("/", middlewareController.verifyTokenAndAdmin, bookController.addBook);
router.put("/:id", middlewareController.verifyTokenAndAdmin, bookController.updateBook);
router.delete("/:id", middlewareController.verifyTokenAndAdmin, bookController.deleteBook);

module.exports = router;