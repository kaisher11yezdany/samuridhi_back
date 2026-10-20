/**
 * Seeds chart data using native MongoDB driver to preserve custom createdAt dates.
 * Mongoose timestamps: true overrides createdAt on insertMany, so we go native.
 * Run: node seedCharts.js
 */
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://sitesjaiton_db_user:BYRKkL95NbWv4Ram@cluster0.rqq4ya7.mongodb.net/elevatorx2';

function dateInMonth(monthOffset) {
  const now = new Date();
  const day = Math.ceil(Math.random() * 25) + 1;
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day, 10, 0, 0);
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const CUSTOMERS  = ['Prestige Corp', 'RMZ Infra', 'Brigade Group', 'Sobha Developers', 'Puravankara Ltd', 'Total Env'];
const SITES      = ['Prestige Tower A', 'RMZ One World', 'Brigade Gateway', 'Sobha Dream Acres', 'Puravankara Pearl', 'Total Serene'];
const COMPLAINTS = [
  'Elevator stuck between floors', 'Door not closing properly',
  'Unusual noise during operation', 'Slow door response',
  'Emergency button malfunction', 'Display panel not working',
  'Cabin light failure', 'Overloading alarm false trigger',
];
const TECHNICIANS = ['Ramesh Kumar', 'Suresh Nair', 'Vijay Sharma', 'Ankit Patel', 'Deepak Rao'];
const ELEVATORS   = ['ELV-001', 'ELV-002', 'ELV-003', 'ELV-004', 'ELV-005', 'ELV-006'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('Connected. Inserting via native driver (preserves createdAt)…');

  // ── Remove previous seed data ─────────────────────────────────────────────
  await db.collection('projects').deleteMany({ projectId: /^PRJ-SEED-/ });
  await db.collection('breakdowns').deleteMany({ ticketId: /^TKT-SEED-/ });
  await db.collection('maintenances').deleteMany({ maintenanceId: /^MNT-SEED-/ });
  console.log('Cleared old seed records');

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectStatusMap = [
    ['Completed', 'Completed', 'In Progress'],
    ['Completed', 'In Progress', 'In Progress'],
    ['Completed', 'In Progress', 'Delayed'],
    ['In Progress', 'In Progress', 'Completed'],
    ['In Progress', 'Completed', 'In Progress'],
    ['In Progress', 'Delayed',   'In Progress'],
  ];

  const projects = [];
  let pc = 100;
  for (let mo = -5; mo <= 0; mo++) {
    for (const status of projectStatusMap[mo + 5]) {
      pc++;
      const cIdx = randInt(0, CUSTOMERS.length - 1);
      const ts   = dateInMonth(mo);
      projects.push({
        projectId:   `PRJ-SEED-${pc}`,
        projectName: `${CUSTOMERS[cIdx]} Project ${pc}`,
        customer:    CUSTOMERS[cIdx],
        site:        SITES[cIdx],
        elevators:   randInt(1, 5),
        startDate:   ts.toISOString().slice(0, 10),
        targetDate:  new Date(ts.getTime() + 90 * 86400000).toISOString().slice(0, 10),
        budget:      String(randInt(10, 30) * 100000),
        progress:    status === 'Completed' ? 100 : status === 'Delayed' ? randInt(20, 45) : randInt(30, 80),
        status,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  }
  await db.collection('projects').insertMany(projects);
  console.log(`Inserted ${projects.length} projects`);

  // ── Breakdowns ────────────────────────────────────────────────────────────
  const OPEN_ST   = ['Pending', 'Assigned', 'In Progress'];
  const CLOSED_ST = ['Resolved', 'Closed'];
  const PRIORITIES = ['CRITICAL','HIGH','MEDIUM','MEDIUM','LOW'];

  const breakdowns = [];
  let tk = 200;
  for (let mo = -5; mo <= 0; mo++) {
    const openN   = randInt(2, 3);
    const closedN = randInt(2, 3);
    for (let i = 0; i < openN + closedN; i++) {
      tk++;
      const ts   = dateInMonth(mo);
      const open = i < openN;
      const cIdx = randInt(0, CUSTOMERS.length - 1);
      breakdowns.push({
        ticketId:   `TKT-SEED-${tk}`,
        customer:   CUSTOMERS[cIdx],
        site:       SITES[cIdx],
        elevatorId: rand(ELEVATORS),
        complaint:  rand(COMPLAINTS),
        priority:   rand(PRIORITIES),
        technician: rand(TECHNICIANS),
        slaHours:   24,
        status:     open ? rand(OPEN_ST) : rand(CLOSED_ST),
        resolvedAt: open ? undefined : new Date(ts.getTime() + 2 * 86400000),
        createdAt:  ts,
        updatedAt:  ts,
      });
    }
  }
  await db.collection('breakdowns').insertMany(breakdowns);
  console.log(`Inserted ${breakdowns.length} breakdowns`);

  // ── Maintenance ───────────────────────────────────────────────────────────
  const maintenance = [];
  let mc = 300;
  for (let mo = -5; mo <= 0; mo++) {
    const count = randInt(3, 5);
    for (let i = 0; i < count; i++) {
      mc++;
      const ts   = dateInMonth(mo);
      const cIdx = randInt(0, CUSTOMERS.length - 1);
      maintenance.push({
        maintenanceId: `MNT-SEED-${mc}`,
        elevatorId:    rand(ELEVATORS),
        customer:      CUSTOMERS[cIdx],
        site:          SITES[cIdx],
        schedule:      rand(['Monthly', 'Quarterly', 'Half-Yearly']),
        dueDate:       ts.toISOString().slice(0, 10),
        completedDate: ts.toISOString().slice(0, 10),
        technician:    rand(TECHNICIANS),
        type:          rand(['Routine', 'Intensive']),
        status:        'Completed',
        createdAt:     ts,
        updatedAt:     ts,
      });
    }
  }
  await db.collection('maintenances').insertMany(maintenance);
  console.log(`Inserted ${maintenance.length} maintenance records`);

  await mongoose.disconnect();
  console.log('\nDone! Hard-refresh the dashboard (Ctrl+Shift+R) to see charts.');
}

seed().catch(err => { console.error(err); process.exit(1); });
