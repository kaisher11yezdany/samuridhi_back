const express = require('express');
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/auth');
const router = express.Router();

function getScope(user, action) {
  if (user.permissions?.maintenance?.[action]) return user.permissions.maintenance[action];
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
    const scope = getScope(req.user, 'view');
    if (scope === 'none') return res.json([]);
    const filter = scope === 'own' ? { assignedUsers: req.user.id } : {};
    res.json(await Maintenance.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'create');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to create' });
    const count = await Maintenance.countDocuments();
    const doc = await Maintenance.create({ ...req.body, maintenanceId: `MNT-${String(count+1).padStart(4,'0')}` });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'edit');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to edit' });
    const existing = await Maintenance.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (scope === 'own' && !existing.assignedUsers?.map(String).includes(String(req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const doc = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'delete');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to delete' });
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Assign users to a maintenance task
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { role, permissions } = req.user;
    const canAssign = ['Super Admin', 'Management', 'Project Manager'].includes(role) ||
                      permissions?.maintenance?.edit === 'all';
    if (!canAssign) return res.status(403).json({ message: 'No permission to assign' });
    const { userIds } = req.body;
    const doc = await Maintenance.findByIdAndUpdate(req.params.id, { assignedUsers: userIds }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
