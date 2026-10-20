const express = require('express');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

const crudRoutes = (Model, name, module, idField, prefix) => {
  router.get('/', auth, async (req, res) => {
    try { res.json(await Model.find().sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ message: err.message }); }
  });
  router.get('/:id', auth, async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });
  router.post('/', auth, async (req, res) => {
    try {
      const count = await Model.countDocuments();
      const doc = await Model.create({ ...req.body, [idField]: `${prefix}-${String(count+1).padStart(3,'0')}` });
      await AuditLog.create({ user: req.user.name, role: req.user.role, action: `${name} Created`, module, target: doc[idField], ip: req.ip, severity: 'Info' });
      res.status(201).json(doc);
    } catch (err) { res.status(400).json({ message: err.message }); }
  });
  router.put('/:id', auth, async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (err) { res.status(400).json({ message: err.message }); }
  });
  router.delete('/:id', auth, async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  });
};

crudRoutes(Project, 'Project', 'Project Management', 'projectId', 'PRJ');
module.exports = router;
