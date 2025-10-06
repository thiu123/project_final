const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

// Load environment variables first
dotenv.config();

const bookRoute = require("./routes/book");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const cartRoute = require("./routes/cart");
const reviewRoute = require("./routes/review");
const orderRoute = require("./routes/order");
const favoriteRoute = require("./routes/favorite");
const chatbotRoute = require("./routes/chatbot");
const contactRoute = require("./routes/contact");
const authController = require("./controllers/authController");

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Session middleware cho Passport
app.use(
  session({
    secret: process.env.JWT_ACCESS_KEY || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true nếu dùng HTTPS
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Call function to connect to MongoDB
connectDB();

// Khởi tạo Google OAuth strategy
authController.googleAuth();

//Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/books", bookRoute);
app.use("/api/carts", cartRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/order", orderRoute);
app.use("/api/favorite", favoriteRoute);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/contact", contactRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
