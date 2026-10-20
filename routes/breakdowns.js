const express = require('express');
const Breakdown = require('../models/Breakdown');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

function getScope(user, module, action) {
  if (user.permissions?.[module]?.[action]) return user.permissions[module][action];
  // fallback by role
  if (['Super Admin', 'Management'].includes(user.role)) return 'all';
  if (user.role === 'Project Manager') return action === 'delete' ? 'none' : 'all';
  if (user.role === 'Technician') {
    if (action === 'view' || action === 'edit') return 'own';
    return 'none';
  }
  return 'none';
}

router.get('/', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'breakdown', 'view');
    if (scope === 'none') return res.json([]);
    const filter = scope === 'own' ? { assignedUsers: req.user.id } : {};
    res.json(await Breakdown.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Breakdown.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const scope = getScope(req.user, 'breakdown', 'view');
    if (scope === 'own' && !doc.assignedUsers?.map(String).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'breakdown', 'create');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to create' });
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
    const scope = getScope(req.user, 'breakdown', 'edit');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to edit' });
    const existing = await Breakdown.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (scope === 'own' && !existing.assignedUsers?.map(String).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const doc = await Breakdown.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.status === 'Closed') {
      await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Breakdown Ticket Closed', module: 'Breakdown Service', target: doc.ticketId, ip: req.ip, severity: 'Info' });
    }
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'breakdown', 'delete');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to delete' });
    await Breakdown.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Assign users to a breakdown ticket
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { role, permissions } = req.user;
    const canAssign = ['Super Admin', 'Management', 'Project Manager'].includes(role) ||
                      permissions?.breakdown?.edit === 'all';
    if (!canAssign) return res.status(403).json({ message: 'No permission to assign' });
    const { userIds } = req.body;
    const doc = await Breakdown.findByIdAndUpdate(req.params.id, { assignedUsers: userIds }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
