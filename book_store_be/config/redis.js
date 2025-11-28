const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://localhost:6379", // URL của Redis
});

redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

redisClient.connect().then(() => {
  console.log("✅ Redis connected!");
});

module.exports = redisClient;
