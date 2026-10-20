require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/sites',         require('./routes/sites'));
app.use('/api/elevators',     require('./routes/elevators'));
app.use('/api/installations', require('./routes/installations'));
app.use('/api/survey',        require('./routes/survey'));
app.use('/api/procurement',   require('./routes/procurement'));
app.use('/api/qa',            require('./routes/qa'));
app.use('/api/handover',      require('./routes/handover'));
app.use('/api/maintenance',   require('./routes/maintenance'));
app.use('/api/breakdowns',    require('./routes/breakdowns'));
app.use('/api/technicians',   require('./routes/technicians'));
app.use('/api/testing',       require('./routes/testing'));
app.use('/api/warranty',      require('./routes/warranty'));
app.use('/api/spareparts',    require('./routes/spareparts'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/approvals',     require('./routes/approvals'));
app.use('/api/auditlogs',     require('./routes/auditlogs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/settings',      require('./routes/settings'));
app.use('/api/roles',         require('./routes/roles'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`elevatorX API running on port ${PORT}`));
