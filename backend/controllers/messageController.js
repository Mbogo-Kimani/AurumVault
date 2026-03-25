const Message = require('../models/Message');

// Submit contact form
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newMessage = await Message.create({ name, email, phone, subject, message });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all messages (Admin only)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update message (Admin only)
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) {
      console.warn(`[WARN] Message not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (err) {
    console.error('Update Message Error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

// Delete message (Admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      console.warn(`[WARN] Message not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete Message Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
