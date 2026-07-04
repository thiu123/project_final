const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");
const multer = require("multer");

// Multer config (lưu file tạm để upload lên Cloudinary)
const upload = multer({ dest: "tmp/" });

// GET all users (admin only)
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  userController.getAllUsers
);

// DELETE user
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.deleteUser
);

// UPLOAD images (ví dụ upload avatar hoặc nhiều ảnh)
router.post(
  "/upload-images",
  middlewareController.verifyToken, // chỉ user đã login
  upload.single("image"), // field name phải là "images"
  userController.uploadImages
);

module.exports = router;
