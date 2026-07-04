const axios = require("axios");
const Book = require("../../model/Book");
const removeMd = require("remove-markdown");
const redisClient = require("../../config/redis");

const clearBooksCache = async () => {
  try {
    const keys = await redisClient.keys("books:all:*");
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redisClient.del(key)));
    }
    // Also clear home cache when books change
    await redisClient.del("books:home");
  } catch (error) {
    console.error("Error when deleting cache", error);
  }
};

const bookController = {
  getAllBooks: async (req, res) => {
    try {
      const cacheKey = `books:all:${req.query.subject || "all"}`;

      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      const filter = req.query.subject ? { subjects: req.query.subject } : {};
      const books = await Book.find(filter);

      await redisClient.setEx(cacheKey, 1800, JSON.stringify(books));

      return res.status(200).json(books);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getBookById: async (req, res) => {
    try {
      const cacheKey = `book:${req.params.id}`;

      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      const bookDetails = await Book.findById(req.params.id);

      await redisClient.setEx(cacheKey, 1800, JSON.stringify(bookDetails));

      return res.status(200).json(bookDetails);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addBook: async (req, res) => {
    try {
      const newBook = new Book(req.body);
      const book = await newBook.save();

      await clearBooksCache();

      res.status(201).json({ message: "Add book successfully", book: newBook });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);

      await redisClient.del(`book:${req.params.id}`);

      await clearBooksCache();

      res.status(200).json({ message: "Delete book successfully", book: book });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateBook: async (req, res) => {
    try {
      const updateBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updateBook) {
        return res.status(404).json({ message: "Can't find book" });
      }

      // Xóa cache của book cụ thể
      await redisClient.del(`book:${req.params.id}`);

      // Xóa tất cả cache books (tất cả subjects)
      await clearBooksCache();

      res
        .status(200)
        .json({ message: "Update book successfully", book: updateBook });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // getBooksBySubject: async (req, res) => {
  //   try {
  //     const subject = req.params.subject.replace(/_/g, " ");

  //     // Check text có phải English không
  //     const isEnglishText = (text) => {
  //       if (!text) return false;
  //       const cleaned = text.replace(/[\d\s.,;:!?'"()\[\]{}<>–—…]/g, "");
  //       const englishChars = (cleaned.match(/[a-zA-Z]/g) || []).length;
  //       const nonEnglishChars = (cleaned.match(/[^\x00-\x7F]/g) || []).length;
  //       const total = englishChars + nonEnglishChars;
  //       return total > 0 && englishChars / total >= 0.9;
  //     };

  //     // Clean markdown
  //     const cleanMarkdown = (text) =>
  //       text
  //         ? removeMd(text, { stripListLeaders: true, gfm: true })
  //             .replace(/\r?\n|\r/g, " ")
  //             .trim()
  //         : text;

  //     // Fetch subject
  //     const { data } = await axios.get(
  //       `https://openlibrary.org/subjects/${subject}.json?limit=50`
  //     );

  //     const books = [];

  //     for (const book of data.works) {
  //       try {
  //         const workDetail = await axios.get(
  //           `https://openlibrary.org${book.key}.json`
  //         );

  //         if (!workDetail.data.description) continue;

  //         const rawDesc =
  //           typeof workDetail.data.description === "string"
  //             ? workDetail.data.description
  //             : workDetail.data.description.value;

  //         if (!isEnglishText(rawDesc) && !isEnglishText(book.title)) continue;

  //         const description = cleanMarkdown(rawDesc);

  //         const bookData = {
  //           key: book.key,
  //           title: book.title,
  //           cover_url: book.cover_id
  //             ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
  //             : null,
  //           first_publish_year: book.first_publish_year,
  //           authors: book.authors.map((a) => a.name),
  //           price: Math.floor(Math.random() * 25) + 5,
  //           subjects: [subject],
  //           description,
  //           rating: (Math.random() * 2 + 3).toFixed(1),
  //           stock: Math.floor(Math.random() * 101),
  //         };

  //         books.push(bookData);
  //         await Book.findOneAndUpdate({ key: book.key }, bookData, {
  //           upsert: true,
  //         });
  //       } catch {
  //         continue;
  //       }
  //     }

  //     return res.status(200).json(books);
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },

  searchBooksByTitle: async (req, res) => {
    try {
      const query = req.query.title?.trim();
      if (!query) return res.status(200).json([]);

      const books = await Book.find({
        title: { $regex: query, $options: "i" },
      });

      return res.status(200).json(books);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Single endpoint for home page — 1 DB query, grouped by subject,
  // capped to the newest books per group to keep the payload small
  homeBooks: async (req, res) => {
    try {
      const cacheKey = "books:home";
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));

      const BOOKS_PER_GROUP = 10;

      // Exclude the heavy `description` field — home cards don't show it
      const allBooksSorted = await Book.find({})
        .select("-description")
        .sort({ createdAt: -1 });

      // Group the newest books by each subject they belong to, capped per subject
      const subjects = {};
      allBooksSorted.forEach((book) => {
        (book.subjects || []).forEach((subject) => {
          const key = subject.toLowerCase();
          if (!subjects[key]) subjects[key] = [];
          if (subjects[key].length < BOOKS_PER_GROUP) {
            subjects[key].push(book);
          }
        });
      });

      const result = {
        all: allBooksSorted.slice(0, BOOKS_PER_GROUP),
        subjects,
      };
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(result));
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = bookController;
