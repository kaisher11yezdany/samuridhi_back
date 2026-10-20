const express = require('express');
const Technician = require('../models/Technician');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await Technician.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Technician.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await Technician.countDocuments();
    const doc = await Technician.create({ ...req.body, techId: `TECH-${String(count+1).padStart(3,'0')}` });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Technician.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
