const express = require('express');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const Technician = require('../models/Technician');
const auth = require('../middleware/auth');
const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

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

// ── Technician document routes ─────────────────────────────────────────────
router.get('/:id/documents', auth, async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Not found' });
    res.json(tech.documents);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/documents', auth, upload.single('file'), async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Not found' });
    const newDoc = {
      name: req.body.name || req.file?.originalname || 'Document',
      docType: req.body.docType || 'Other',
      uploadedBy: req.user.name,
      status: 'Pending',
    };
    if (req.file) {
      newDoc.filePath = req.file.filename;
      newDoc.fileSize = formatSize(req.file.size);
    }
    tech.documents.push(newDoc);
    await tech.save();
    res.status(201).json(tech.documents[tech.documents.length - 1]);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/documents/:docId', auth, async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Not found' });
    const doc = tech.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    if (req.body.status)  doc.status  = req.body.status;
    if (req.body.remarks !== undefined) doc.remarks = req.body.remarks;
    // auto-set technician verified if all docs verified
    tech.verified = tech.documents.length > 0 && tech.documents.every(d => d.status === 'Verified');
    await tech.save();
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id/documents/:docId', auth, async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Not found' });
    const doc = tech.documents.id(req.params.docId);
    if (doc?.filePath) {
      const fp = path.join(UPLOADS_DIR, doc.filePath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    tech.documents.pull(req.params.docId);
    await tech.save();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

module.exports = router;
