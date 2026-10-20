const express = require('express');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

function getScope(user, action) {
  if (user.permissions?.projects?.[action]) return user.permissions.projects[action];
  if (['Super Admin', 'Management'].includes(user.role)) return 'all';
  if (user.role === 'Project Manager') return action === 'delete' ? 'none' : 'all';
  return 'none';
}

router.get('/', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'view');
    if (scope === 'none') return res.json([]);
    const filter = scope === 'own' ? { assignedUsers: req.user.id } : {};
    res.json(await Project.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Project.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'create');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to create' });
    const count = await Project.countDocuments();
    const doc = await Project.create({ ...req.body, projectId: `PRJ-${String(count+1).padStart(3,'0')}` });
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Project Created', module: 'Project Management', target: doc.projectId, ip: req.ip, severity: 'Info' });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'edit');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to edit' });
    const doc = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const scope = getScope(req.user, 'delete');
    if (scope === 'none') return res.status(403).json({ message: 'No permission to delete' });
    const doc = await Project.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Assign users to a project
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { role, permissions } = req.user;
    const canAssign = ['Super Admin', 'Management'].includes(role) ||
                      permissions?.projects?.edit === 'all';
    if (!canAssign) return res.status(403).json({ message: 'No permission to assign' });
    const { userIds } = req.body;
    const doc = await Project.findByIdAndUpdate(req.params.id, { assignedUsers: userIds }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
