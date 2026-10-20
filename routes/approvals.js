const express = require('express');
const Approval = require('../models/Approval');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (status && status !== 'All') filter.status = status;
    res.json(await Approval.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await Approval.countDocuments();
    const doc = await Approval.create({ ...req.body, approvalId: `APR-${String(count+1).padStart(3,'0')}`, requestedBy: req.user.name });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Approval.findByIdAndUpdate(req.params.id, { ...req.body, approvedBy: req.user.name }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const action = req.body.status === 'Approved' ? 'Approval Granted' : req.body.status === 'Rejected' ? 'Approval Rejected' : 'Approval Updated';
    await AuditLog.create({ user: req.user.name, role: req.user.role, action, module: 'Approval Workflows', target: `${doc.type}: ${doc.reference}`, ip: req.ip, severity: req.body.status === 'Rejected' ? 'Warning' : 'Info' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
