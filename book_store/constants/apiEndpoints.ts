// Backend route prefixes (must match book_store_be/server.js app.use() mounts)
export const API_ENDPOINTS = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  BOOKS: "/api/books",
  CARTS: "/api/carts",
  REVIEWS: "/api/reviews",
  ORDER: "/api/order",
  FAVORITE: "/api/favorite",
  CHATBOT: "/api/chatbot",
  CONTACT: "/api/contact",
  VOUCHER: "/api/voucher",
} as const;
