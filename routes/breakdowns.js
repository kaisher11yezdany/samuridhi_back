const express = require('express');
const Breakdown = require('../models/Breakdown');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await Breakdown.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Breakdown.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await Breakdown.countDocuments();
    const ticketId = `#TKT-${String(1000 + count + 1).padStart(6, '0')}`;
    const doc = await Breakdown.create({ ...req.body, ticketId });
    if (doc.priority === 'CRITICAL') {
      await Notification.create({ type: 'Critical', icon: '🆘', title: 'Elevator Breakdown', message: `${doc.elevatorId || 'Elevator'} breakdown reported at ${doc.site || doc.customer}. Ticket: ${ticketId}`, module: 'Breakdown' });
    }
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Breakdown Ticket Created', module: 'Breakdown Service', target: ticketId, ip: req.ip, severity: doc.priority === 'CRITICAL' ? 'Critical' : 'Warning' });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Breakdown.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (req.body.status === 'Closed') {
      await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Breakdown Ticket Closed', module: 'Breakdown Service', target: doc.ticketId, ip: req.ip, severity: 'Info' });
    }
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    await Breakdown.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
