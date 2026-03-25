const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { auth, adminOnly } = require('../middlewares/auth');
 
// GET /api/logs?type=cron
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (err) {
    console.error('Log fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
