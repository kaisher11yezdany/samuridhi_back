const express = require('express');
const SparePart = require('../models/SparePart');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { res.json(await SparePart.find().sort({ partName: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const count = await SparePart.countDocuments();
    const doc = await SparePart.create({ ...req.body, partId: `PART-${String(count+1).padStart(3,'0')}` });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.stock !== undefined) {
      body.status = body.stock === 0 ? 'Out of Stock' : body.stock <= (body.minStock || 10) ? 'Low Stock' : 'In Stock';
    }
    const doc = await SparePart.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    await SparePart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
