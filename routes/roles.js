const express = require('express');
const Role = require('../models/Role');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ message: 'Super Admin only' });
  next();
};

// GET all roles
router.get('/', auth, async (req, res) => {
  try {
    res.json(await Role.find().sort({ name: 1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create role
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update role
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Not found' });
    // Block editing name/isSystem of system roles
    if (role.isSystem && req.body.isSystem === false) {
      return res.status(400).json({ message: 'Cannot remove system flag from default roles' });
    }
    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE role
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Not found' });
    if (role.isSystem) return res.status(400).json({ message: 'Cannot delete a system role' });
    // Unassign from users
    await User.updateMany({ roleId: req.params.id }, { $unset: { roleId: 1 } });
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Assign role to user
router.post('/assign-user', auth, adminOnly, async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { roleId: roleId || null }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
