const express = require('express');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const active = await Customer.countDocuments({ status: 'Active' });
    const pending = await Customer.countDocuments({ status: 'Pending' });
    res.json({ total, active, pending });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    const customerId = `CUST-${String(count + 1).padStart(3, '0')}`;
    const customer = await Customer.create({ ...req.body, customerId });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Customer Created', module: 'Customer Management', target: customer.companyName, ip: req.ip, severity: 'Info' });
    res.status(201).json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Not found' });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Customer Updated', module: 'Customer Management', target: customer.companyName, ip: req.ip, severity: 'Info' });
    res.json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Not found' });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Customer Deleted', module: 'Customer Management', target: customer.companyName, ip: req.ip, severity: 'Critical' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
