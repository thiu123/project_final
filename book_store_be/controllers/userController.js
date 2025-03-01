const User = require("../model/User");

const userController = {
    getAllUsers: async (req,res) => {
        try {
            const user = await User.find(); 
            return res.status(200).json(user);
        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    },
    deleteUser: async (req,res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("Deleted successfully");
        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

module.exports = userController;