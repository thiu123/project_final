const router = require("express").Router();
const contactController = require("../controllers/contact/contactController");
const middlewareController = require("../controllers/middlewareController");

// User routes
router.post(
  "/",
  middlewareController.verifyToken,
  contactController.createContact
);

router.get(
  "/user",
  middlewareController.verifyToken,
  contactController.getUserContacts
);

// Admin routes
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  contactController.getAllContacts
);

router.get(
  "/:id",
  middlewareController.verifyToken,
  contactController.getContactById
);

router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  contactController.deleteContact
);

module.exports = router;
