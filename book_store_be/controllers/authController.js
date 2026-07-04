const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
// const cookieParser = require('cookie-parser');

const authController = {
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      const user = await newUser.save();
      const { password, resetPasswordToken, resetPasswordExpires, ...others } =
        user._doc;
      return res.status(200).json(others);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid current password" });
      }

      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedNewPassword;
      await user.save();
      return res.status(200).json({ msg: "Password changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30d" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({
        username: req.body.username,
      });
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!validPassword) {
        return res.status(400).json({ msg: "Invalid password" });
      }

      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: false,
        });

        const {
          password,
          resetPasswordToken,
          resetPasswordExpires,
          ...others
        } = user._doc;
        return res
          .status(200)
          .json({ msg: "Login successful", accessToken, ...others });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: "You are not authenticated" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }

      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: false,
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  },
  googleAuth: async (req, res) => {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
          try {
            // Try to find existing user
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
              // Create new user if not exists
              user = new User({
                username: profile.displayName,
                googleId: profile.id,
                email: profile.emails[0].value,
                avatar_url: profile.photos[0].value,
              });
              await user.save();
            }
            return cb(null, user);
          } catch (err) {
            return cb(err);
          }
        }
      )
    );
    passport.serializeUser((user, cb) => {
      cb(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
      const user = await User.findById(id);
      done(null, user);
    });
  },
  googleCallback: async (req, res) => {
    const user = req.user;
    const accessToken = authController.generateAccessToken(user);
    const refreshToken = authController.generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    // Redirect về frontend với token trong URL
    const frontendURL = `http://localhost:3000?googleAuth=success&token=${accessToken}&user=${encodeURIComponent(
      JSON.stringify(user)
    )}`;
    res.redirect(frontendURL);
  },

  // Forgot Password - Generate reset token
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ msg: "Email is required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User not found with this email" });
      }

      if (!user.password) {
        return res.status(400).json({
          msg: "This account uses Google login. Please use Google to sign in.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      return res.status(200).json({
        msg: "Password reset token generated",
        resetToken,
        email: user.email,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          msg: "Reset token and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          msg: "Password must be at least 6 characters",
        });
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          msg: "Invalid or expired reset token",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({
        msg: "Password reset successfully",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = authController;
