const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");
const multer = require("multer");

// Multer config (lưu file tạm để upload lên Cloudinary)
// Giới hạn 10MB vì đây là mức tối đa của gói Cloudinary free
const upload = multer({
  dest: "tmp/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ msg: "File too large. Maximum size is 10MB." });
        }
        return res.status(400).json({ msg: err.message });
      }
      next();
    });
  },
  userController.uploadImages
);

module.exports = router;
