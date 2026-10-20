const express = require('express');
const Elevator = require('../models/Elevator');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await Elevator.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Elevator.countDocuments();
    const operational = await Elevator.countDocuments({ status: 'Operational' });
    const maintenance = await Elevator.countDocuments({ status: 'Maintenance' });
    const breakdown = await Elevator.countDocuments({ status: 'Breakdown' });
    res.json({ total, operational, maintenance, breakdown });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Elevator.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await Elevator.countDocuments();
    const elevatorId = `ELX-BLR-${String(200000 + count + 1)}`;
    const doc = await Elevator.create({ ...req.body, elevatorId });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Elevator Registered', module: 'Elevator Assets', target: elevatorId, ip: req.ip, severity: 'Info' });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Elevator.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Elevator Status Changed', module: 'Elevator Assets', target: `${doc.elevatorId}: ${req.body.status || 'Updated'}`, ip: req.ip, severity: 'Info' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    await Elevator.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
