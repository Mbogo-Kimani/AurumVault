const Quote = require('../models/Quote');

exports.createQuote = async (req, res) => {
  try {
    const quote = new Quote(req.body);
    const saved = await quote.save();
    res.status(201).json({ message: 'Quote created successfully', quote: saved });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create quote', error: err.message });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
};

exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.status(200).json(quote);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update quote', error: err.message });
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.status(200).json({ message: 'Quote deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete quote', error: err.message });
  }
};

