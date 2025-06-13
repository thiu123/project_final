const Cart = require("../../model/Cart");
const Book = require("../../model/Book");

const cartsController = {
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id }).populate(
        "items.bookId"
      );
      if (!cart) {
        return res.status(200).json({ userId: req.user.id, items: [] });
      }
      return res.status(200).json(cart);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  addToCart: async (req, res) => {
    try {
      const { bookId, quantity } = req.body;
      let cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        cart = new Cart({
          userId: req.user.id,
          items: [{ bookId, quantity }],
        });
      } else {
        const itemIndex = cart.items.findIndex(
          (item) => item.bookId.toString() === bookId
        );
        if (itemIndex !== -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ bookId, quantity });
        }
      }
      await cart.save();
      return res.status(200).json(cart);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const { bookId, quantity } = req.body;
      if (!bookId || quantity < 1) {
        return res.status(400).json({ msg: "Invalid bookId or quantity" });
      }
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        return res.status(404).json({ msg: "Cart not found" });
      }

      const item = cart.items.find((item) => item.bookId.toString() === bookId);
      if (!item) {
        return res.status(404).json({ msg: "Item not found" });
      }
      item.quantity = quantity;
      await cart.save();
      return res.status(200).json(cart);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  removeItem: async (req, res) => {
    try {
      const { bookId } = req.body;
      if (!bookId) {
        return res.status(400).json({ msg: "Invalid bookId" });
      }
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        return res.status(404).json({ msg: "Cart not found" });
      }
      cart.items = cart.items.filter(
        (item) => item.bookId.toString() !== bookId
      );
      await cart.save();
      return res.status(200).json(cart);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteCart: async (req, res) => {
    try {
      const cart = await Cart.findOneAndDelete({ userId: req.user.id });
      if (!cart) {
        return res.status(404).json({ msg: "Cart not found" });
      }
      return res.status(200).json({ msg: "Cart deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = cartsController;
