const axios = require("axios");
const Book = require("../../model/Book");

const bookController = {
  getAllBooks: async (req, res) => {
    try {
      const filter = req.query.subject ? { subjects: req.query.subject } : {};
      const books = await Book.find(filter);
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
      let subject = req.params.subject.replace(/_/g, " ");

      // If not found, fetch from OpenLibrary
      const response = await axios.get(
        `https://openlibrary.org/subjects/${subject}.json?limit=100`
      );
      const books = response.data.works.map((book) => ({
        key: book.key,
        title: book.title,
        cover_url: book.cover_id
          ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
          : null,
        first_publish_year: book.first_publish_year,
        authors: book.authors.map((author) => author.name),
        price: Math.floor(Math.random() * 50) + 10,
        subjects: [subject],
      }));

      for (const book of books) {
        await Book.findOneAndUpdate({ key: book.key }, book, { upsert: true });
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
