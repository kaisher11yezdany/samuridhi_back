const express = require('express');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const auth    = require('../middleware/auth');
const router  = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  try {
    const { category, project } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (project) filter.project = new RegExp(project, 'i');
    res.json(await Document.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const count = await Document.countDocuments();
    const payload = { ...req.body, docId: `DOC-${String(count+1).padStart(3,'0')}`, uploadedBy: req.user.name };
    if (req.file) {
      payload.filePath = req.file.filename;
      payload.fileSize = formatSize(req.file.size);
    }
    const doc = await Document.create(payload);
    await AuditLog.create({ user: req.user.name, role: req.user.role, action: 'Document Uploaded', module: 'Documents', target: doc.name, ip: req.ip, severity: 'Info' });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (doc?.filePath) {
      const fp = path.join(UPLOADS_DIR, doc.filePath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

module.exports = router;
