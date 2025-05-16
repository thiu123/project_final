const Cart = require('../model/Cart');
const Book = require('../model/Book');

const cartController = {
    getCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({ userId: req.user.id }).populate('items.bookId');
            if (!cart) {
                return res.status(404).json({ msg: 'Cart not found' });
            }
            return res.status(200).json(cart);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
}
    
