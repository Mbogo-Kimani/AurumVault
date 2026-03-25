const Subscriber = require('../models/Subscriber');
const emailService = require('../utils/emailService');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ message: 'Already subscribed' });
      } else {
        existing.status = 'active';
        await existing.save();
        await emailService.sendSubscriptionWelcome(email);
        return res.status(200).json({ message: 'Subscription reactivated' });
      }
    }

    const newSubscriber = await Subscriber.create({ email });
    await emailService.sendSubscriptionWelcome(email);
    res.status(201).json({ message: 'Subscribed successfully', data: newSubscriber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
