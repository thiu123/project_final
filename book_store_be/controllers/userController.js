const User = require("../model/User");
const cloudinary = require("../config/cloudinary"); // 👈 import ở đây
const fs = require("fs");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Deleted successfully");
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  uploadImages: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const uploadType = req.query.type || req.body.type || "avatar";

      const folderMap = {
        avatar: "avatars",
        book: "books",
      };

      // Upload lên Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folderMap[uploadType] || "uploads",
        resource_type: "image",
      });

      // Xóa file tạm sau khi upload
      fs.unlinkSync(req.file.path);

      let responseData = {
        url: result.secure_url,
        public_id: result.public_id,
        type: uploadType,
      };

      switch (uploadType) {
        case "avatar":
          // Cập nhật avatar của user
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatar_url: result.secure_url },
            { new: true }
          ).select("-password");

          responseData = updatedUser;
          break;

        case "book":
          responseData = {
            url: result.secure_url,
            public_id: result.public_id,
            type: "book",
          };
          break;
      }

      res.status(200).json({
        message: `Upload ${uploadType} successfully`,
        data: responseData,
      });
    } catch (err) {
      console.error(`Upload ${req.query.type || "file"} error:`, err);

      // Đảm bảo xóa file tạm nếu có lỗi
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temp file:", unlinkError);
        }
      }

      res.status(500).json({
        msg: err.message || "Upload failed",
      });
    }
  },
};

module.exports = userController;
