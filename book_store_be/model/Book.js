const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    cover_url: { type: String },
    first_publish_year: { type: Number },
    authors: { type: [String], required: true },
    price: { type: Number, default: 0 },
    subjects: { type: [String], default: [] },
    description: { type: String },
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
