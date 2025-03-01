const Book = require("../../model/Book");

const bookController = {
    getAllBooks: async (req,res) => {
        try {
            const books = await Book.find();
            return res.status(200).json(books);
        } catch {
            return res.status(500).json({msg: err.message});
        }
    },
    getBookById: async (req,res) => {
        try {
            const bookDetails = await Book.findById(req.params.id);
            return res.status(200).json(bookDetails);
        } catch {
            return res.status(500).json({msg: err.message});
        }
    },
    addBook: async(req,res) => {
        try {
            const newBook = new Book(req.body);
            const book = await newBook.save();
            res.status(201).json({ message: "Add book successfully", book: newBook });
        } catch {
            return res.status(500).json({msg: err.message});
        }
    },
    deleteBook: async(req,res) => {
        try {
            const book = await Book.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "Delete book successfully", book: book });
        } catch {
            return res.status(500).json({msg: err.message});
        }
    },
    updateBook: async(req,res) => {
        try {
            const updateBook = await Book.fingByIdAndUpdate(req.params.id, req.body, {new: true});
            res.status(200).json({ message: "Update book successfully", book: updateBook });

        if (!updateBook) {
            return res.status(404).json({ message: "Can't find book" });
        }
        } catch {
            return res.status(500).json({msg: err.message});
        }
    }
}
module.exports = bookController;