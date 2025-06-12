const Message = require('../models/Message');

// Submit contact form
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newMessage = await Message.create({ name, email, phone, message });

    res.status(201).json({
      msg: 'Message sent successfully',
      data: newMessage,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all messages (Admin only)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
