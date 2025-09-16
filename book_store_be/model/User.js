const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLenght: 6,
    maxLenght: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minLenght: 10,
    maxLenght: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLenght: 6,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  avatar_url: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("User", userSchema);
