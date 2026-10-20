const express = require('express');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { module, severity, search, limit = 100 } = req.query;
    const filter = {};
    if (module && module !== 'All') filter.module = module;
    if (severity && severity !== 'All') filter.severity = severity;
    if (search) {
      filter.$or = [
        { user: new RegExp(search, 'i') },
        { action: new RegExp(search, 'i') },
        { target: new RegExp(search, 'i') },
      ];
    }
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
