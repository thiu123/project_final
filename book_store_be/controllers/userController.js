const User = require("../model/User");
const cloudinary = require("../config/cloudinary"); // 👈 import ở đây
const fs = require("fs");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
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

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "product",
        resource_type: "image",
      });

      fs.unlinkSync(req.file.path); // Xoá file tạm sau khi upload

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { avatar_url: result.secure_url },
        { new: true }
      ).select("-password");

      res.status(200).json({
        message: "Upload images successfully",
        data: updatedUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = userController;
