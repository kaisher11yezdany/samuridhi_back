const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await Notification.find().sort({ createdAt: -1 }).limit(50)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/unread-count', auth, async (req, res) => {
  try { res.json({ count: await Notification.countDocuments({ read: false }) }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/:id/read', auth, async (req, res) => {
  try {
    const doc = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All marked read' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
