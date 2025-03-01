const { get } = require("mongoose");
const Book = require("../../models/Book");

const bookController = {
    getAllBooks: async (req,res) => {
        try {
            const books = await Book.find();
            return res.status(200).json(books);
        } catch {
            
        }
    }
}