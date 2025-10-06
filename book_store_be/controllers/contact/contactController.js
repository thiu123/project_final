const Contact = require("../../model/Contact");

const contactController = {
  // Create contact
  createContact: async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;
      const username = req.user.username;

      if (!message || message.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Message must be at least 10 characters",
        });
      }

      const newContact = new Contact({
        user: userId,
        username: username,
        message: message,
      });

      const savedContact = await newContact.save();

      res.status(201).json({
        success: true,
        message: "Contact message sent successfully",
        data: savedContact,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all contacts (Admin only)
  getAllContacts: async (req, res) => {
    try {
      const contacts = await Contact.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get user's contacts
  getUserContacts: async (req, res) => {
    try {
      const userId = req.user.id;

      const contacts = await Contact.find({ user: userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get contact by ID
  getContactById: async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id).populate(
        "user",
        "username email"
      );

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found",
        });
      }

      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete contact (Admin only)
  deleteContact: async (req, res) => {
    try {
      const contact = await Contact.findByIdAndDelete(req.params.id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Contact deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = contactController;
