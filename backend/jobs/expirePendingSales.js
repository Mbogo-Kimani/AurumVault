const cron = require('node-cron');
const Sale = require('../models/Sale');
const Log = require('../models/Log');

cron.schedule('*/5 * * * *', async () => {
  try {
    const expiryMinutes = 15;
    const threshold = new Date(Date.now() - expiryMinutes * 60 * 1000);

    const result = await Sale.updateMany(
      { status: 'Pending', createdAt: { $lt: threshold } },
      { $set: { status: 'Failed' } }
    );

    if (result.modifiedCount > 0) {
      const logEntry = await Log.create({
        type: 'cron',
        message: `Marked ${result.modifiedCount} STK transactions as Failed (expired).`,
        metadata: { expiredCount: result.modifiedCount, expiredBefore: threshold },
      });

      console.log('[Cron]', logEntry.message);
    }
  } catch (err) {
    console.error('[Cron] Error expiring STK:', err.message);

    await Log.create({
      type: 'error',
      message: 'Failed to expire STK transactions in cron job',
      metadata: { error: err.message },
    });
  }
});
