const axios = require("axios");
const Book = require("../../model/Book");
const removeMd = require("remove-markdown");
const bookController = {
  getAllBooks: async (req, res) => {
    try {
      const filter = req.query.subject ? { subjects: req.query.subject } : {};

      // Tổng số sách trong DB
      const total = await Book.countDocuments(filter);

      let query = Book.find(filter);

      // Nếu có query half=true → chỉ lấy 1 nửa
      if (req.query.half === "true") {
        const half = Math.ceil(total / 3);
        query = query.limit(half);
      }

      const books = await query;
      return res.status(200).json(books);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getBookById: async (req, res) => {
    try {
      const bookDetails = await Book.findById(req.params.id);
      return res.status(200).json(bookDetails);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addBook: async (req, res) => {
    try {
      const newBook = new Book(req.body);
      const book = await newBook.save();
      res.status(201).json({ message: "Add book successfully", book: newBook });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
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
      res
        .status(200)
        .json({ message: "Update book successfully", book: updateBook });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getBooksBySubject: async (req, res) => {
    try {
      const subject = req.params.subject.replace(/_/g, " ");

      // Check text có phải English không
      const isEnglishText = (text) => {
        if (!text) return false;
        const cleaned = text.replace(/[\d\s.,;:!?'"()\[\]{}<>–—…]/g, "");
        const englishChars = (cleaned.match(/[a-zA-Z]/g) || []).length;
        const nonEnglishChars = (cleaned.match(/[^\x00-\x7F]/g) || []).length;
        const total = englishChars + nonEnglishChars;
        return total > 0 && englishChars / total >= 0.9;
      };

      // Clean markdown
      const cleanMarkdown = (text) =>
        text
          ? removeMd(text, { stripListLeaders: true, gfm: true })
              .replace(/\r?\n|\r/g, " ")
              .trim()
          : text;

      // Fetch subject
      const { data } = await axios.get(
        `https://openlibrary.org/subjects/${subject}.json?limit=50`
      );

      const books = [];

      for (const book of data.works) {
        try {
          const workDetail = await axios.get(
            `https://openlibrary.org${book.key}.json`
          );

          if (!workDetail.data.description) continue;

          const rawDesc =
            typeof workDetail.data.description === "string"
              ? workDetail.data.description
              : workDetail.data.description.value;

          if (!isEnglishText(rawDesc) && !isEnglishText(book.title)) continue;

          const description = cleanMarkdown(rawDesc);

          const bookData = {
            key: book.key,
            title: book.title,
            cover_url: book.cover_id
              ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
              : null,
            first_publish_year: book.first_publish_year,
            authors: book.authors.map((a) => a.name),
            price: Math.floor(Math.random() * 25) + 5,
            subjects: [subject],
            description,
            rating: (Math.random() * 2 + 3).toFixed(1),
            stock: Math.floor(Math.random() * 101),
          };

          books.push(bookData);
          await Book.findOneAndUpdate({ key: book.key }, bookData, {
            upsert: true,
          });
        } catch {
          continue;
        }
      }

      return res.status(200).json(books);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

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
};

module.exports = bookController;
