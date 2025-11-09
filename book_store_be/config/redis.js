const redis = require("redis");

// Tạo kết nối Redis
const redisClient = redis.createClient({
  url: "redis://localhost:6379", // URL của Redis
});

// Xử lý lỗi
redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

// Kết nối Redis
redisClient.connect().then(() => {
  console.log("✅ Redis connected!");
});

module.exports = redisClient;
