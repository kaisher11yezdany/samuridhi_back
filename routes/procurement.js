const express = require('express');
const PurchaseOrder = require('../models/PurchaseOrder');
const Approval = require('../models/Approval');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await PurchaseOrder.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await PurchaseOrder.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await PurchaseOrder.countDocuments();
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(count+1).padStart(3,'0')}`;
    const doc = await PurchaseOrder.create({ ...req.body, poNumber, status: 'Pending' });
    await Approval.create({ type: 'Purchase Order', reference: poNumber, description: `${req.body.items} — ${req.body.amount}`, requestedBy: req.user.name, priority: 'HIGH', currentLevel: 'Project Manager → Management', status: 'Pending' });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'PO Created', module: 'Procurement', target: poNumber, ip: req.ip, severity: 'Info' });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (req.body.status === 'Approved') {
      await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'PO Approved', module: 'Procurement', target: doc.poNumber, ip: req.ip, severity: 'Info' });
    }
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
