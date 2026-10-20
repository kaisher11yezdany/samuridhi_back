require('dotenv').config();
const connectDB = require('./config/db');
const Role = require('./models/Role');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Site = require('./models/Site');
const Project = require('./models/Project');
const Elevator = require('./models/Elevator');
const Technician = require('./models/Technician');
const Breakdown = require('./models/Breakdown');
const Maintenance = require('./models/Maintenance');
const Installation = require('./models/Installation');
const Survey = require('./models/Survey');
const PurchaseOrder = require('./models/PurchaseOrder');
const QARecord = require('./models/QARecord');
const Handover = require('./models/Handover');
const Document = require('./models/Document');
const Approval = require('./models/Approval');
const Notification = require('./models/Notification');
const SparePart = require('./models/SparePart');
const Warranty = require('./models/Warranty');
const Testing = require('./models/Testing');
const AuditLog = require('./models/AuditLog');

const seed = async () => {
  await connectDB();

  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}), Customer.deleteMany({}), Site.deleteMany({}),
    Project.deleteMany({}), Elevator.deleteMany({}), Technician.deleteMany({}),
    Breakdown.deleteMany({}), Maintenance.deleteMany({}), Installation.deleteMany({}),
    Survey.deleteMany({}), PurchaseOrder.deleteMany({}), QARecord.deleteMany({}),
    Handover.deleteMany({}), Document.deleteMany({}), Approval.deleteMany({}),
    Notification.deleteMany({}), SparePart.deleteMany({}), Warranty.deleteMany({}),
    Testing.deleteMany({}), AuditLog.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  // Default Roles
  const all = 'all', own = 'own', none = 'none';
  const MODS = Role.MODULES;
  const mkPerm = (view, create, edit, del) => ({ view, create, edit, delete: del });
  const allPerm  = () => mkPerm(all,  all,  all,  all);
  const ownPerm  = () => mkPerm(own,  own,  own,  none);
  const viewPerm = () => mkPerm(all,  none, none, none);
  const nonePerm = () => mkPerm(none, none, none, none);

  const superAdminPerms = {};
  MODS.forEach(m => { superAdminPerms[m] = allPerm(); });

  const managementPerms = {};
  MODS.forEach(m => {
    managementPerms[m] = ['settings', 'users'].includes(m) ? viewPerm() : mkPerm(all, all, all, m === 'auditlogs' ? none : all);
  });

  const pmPerms = {};
  MODS.forEach(m => {
    if (['dashboard','notifications','elevators','spareparts','warranty'].includes(m)) pmPerms[m] = viewPerm();
    else if (['auditlogs','settings','users','technicians','approvals','reports'].includes(m)) pmPerms[m] = nonePerm();
    else pmPerms[m] = mkPerm(all, own, own, none);
  });

  const techPerms = {};
  MODS.forEach(m => {
    if (['dashboard','notifications','spareparts'].includes(m)) techPerms[m] = viewPerm();
    else if (['breakdown','maintenance'].includes(m)) techPerms[m] = ownPerm();
    else techPerms[m] = nonePerm();
  });

  const [roleAdmin, roleMgmt, rolePM, roleTech] = await Role.create([
    { name: 'Super Admin',     description: 'Full system access',              isSystem: true, permissions: superAdminPerms },
    { name: 'Management',      description: 'Company-wide view and operations',isSystem: true, permissions: managementPerms },
    { name: 'Project Manager', description: 'Project operations and tracking', isSystem: true, permissions: pmPerms },
    { name: 'Technician',      description: 'Field work — own assignments only',isSystem: true, permissions: techPerms },
  ]);
  console.log('Default roles created');

  // Users (with roleId linked)
  const [uAdmin, uManager, uPM, uTech] = await User.create([
    { username: 'admin',   password: 'Admin@123',   name: 'Admin User',   email: 'admin@elevatorx.com',   role: 'Super Admin',     roleId: roleAdmin._id },
    { username: 'manager', password: 'Manager@123', name: 'Priya Sharma', email: 'priya@elevatorx.com',   role: 'Management',      roleId: roleMgmt._id },
    { username: 'pm1',     password: 'PM@123',      name: 'Rajesh Kumar', email: 'rajesh@elevatorx.com',  role: 'Project Manager', roleId: rolePM._id },
    { username: 'tech1',   password: 'Tech@123',    name: 'Anita Singh',  email: 'anita@elevatorx.com',   role: 'Technician',      roleId: roleTech._id },
  ]);
  console.log('Users created');

  // Customers
  const customers = await Customer.insertMany([
    { customerId:'CUST-001', companyName:'ABC Corporation',     contactPerson:'Raj Kumar',   email:'raj@abc.com',    phone:'98765-43210', city:'Mumbai',    gstNumber:'18AABCT1234H1Z0', sites:3, status:'Active' },
    { customerId:'CUST-002', companyName:'XYZ Limited',         contactPerson:'Priya Singh', email:'priya@xyz.com',  phone:'99876-54321', city:'Bangalore', gstNumber:'27AABCX5678J2Z1', sites:5, status:'Active' },
    { customerId:'CUST-003', companyName:'Tech Solutions',      contactPerson:'Amit Patel',  email:'amit@tech.com',  phone:'97654-32109', city:'Pune',      gstNumber:'29AABCS9012K3Z2', sites:2, status:'Pending' },
    { customerId:'CUST-004', companyName:'Central Retail',      contactPerson:'Anita Verma', email:'anita@cr.com',   phone:'96543-21098', city:'Delhi',     gstNumber:'07AABCC3456L4Z3', sites:4, status:'Active' },
    { customerId:'CUST-005', companyName:'Metro Developments',  contactPerson:'Vinod Sharma',email:'vinod@metro.com',phone:'95432-10987', city:'Hyderabad', gstNumber:'36AABCM7890M5Z4', sites:6, status:'Active' },
    { customerId:'CUST-006', companyName:'Green Valley Builders',contactPerson:'Suresh Nair',email:'suresh@gv.com',  phone:'94321-09876', city:'Chennai',   gstNumber:'32AABCG1234N6Z5', sites:2, status:'Active' },
  ]);

  // Sites
  await Site.insertMany([
    { siteId:'SITE-001', siteName:'ABC Tower',      customer:'ABC Corporation',     city:'Mumbai',    location:'Nariman Point', elevators:3, status:'Operational' },
    { siteId:'SITE-002', siteName:'XYZ Complex',    customer:'XYZ Limited',         city:'Bangalore', location:'Whitefield',    elevators:5, status:'Operational' },
    { siteId:'SITE-003', siteName:'Tech Park',      customer:'Tech Solutions',      city:'Pune',      location:'Hinjewadi',     elevators:2, status:'Under Installation' },
    { siteId:'SITE-004', siteName:'Central Mall',   customer:'Central Retail',      city:'Delhi',     location:'Lajpat Nagar',  elevators:4, status:'Operational' },
    { siteId:'SITE-005', siteName:'Metro Heights',  customer:'Metro Developments',  city:'Hyderabad', location:'Gachibowli',    elevators:6, status:'Maintenance' },
    { siteId:'SITE-006', siteName:'Green Residency',customer:'Green Valley Builders',city:'Chennai',  location:'OMR',           elevators:2, status:'Operational' },
  ]);

  // Projects
  await Project.insertMany([
    { projectId:'PRJ-001', projectName:'ABC Tower Lift Project', customer:'ABC Corporation',    site:'ABC Tower',    elevators:3, startDate:'Jan 15, 2025', targetDate:'Mar 15, 2025', progress:100, budget:'19,00,000', cost:'18,50,000', manager:'Rajesh Kumar', status:'Completed' },
    { projectId:'PRJ-002', projectName:'XYZ Complex Expansion',  customer:'XYZ Limited',        site:'XYZ Complex',  elevators:5, startDate:'Feb 10, 2025', targetDate:'May 10, 2025', progress:75,  budget:'30,00,000', cost:'24,00,000', manager:'Rajesh Kumar', status:'In Progress' },
    { projectId:'PRJ-003', projectName:'Tech Park Installation',  customer:'Tech Solutions',     site:'Tech Park',    elevators:2, startDate:'Mar 01, 2025', targetDate:'Apr 30, 2025', progress:45,  budget:'13,00,000', cost:'10,00,000', manager:'Priya Sharma',  status:'In Progress' },
    { projectId:'PRJ-004', projectName:'Central Mall Upgrade',    customer:'Central Retail',     site:'Central Mall', elevators:4, startDate:'Jan 20, 2025', targetDate:'Feb 28, 2025', progress:10,  budget:'14,50,000', cost:'15,75,000', manager:'Rajesh Kumar', status:'Delayed' },
    { projectId:'PRJ-005', projectName:'Metro Heights Lifts',     customer:'Metro Developments', site:'Metro Heights', elevators:6, startDate:'Feb 15, 2025', targetDate:'Jun 15, 2025', progress:38,  budget:'42,00,000', cost:'20,00,000', manager:'Rajesh Kumar', status:'In Progress' },
  ]);

  // Elevators
  await Elevator.insertMany([
    { elevatorId:'ELX-BLR-000124', site:'ABC Tower',      customer:'ABC Corporation',    building:'Block A',    type:'Passenger',    capacity:'1500 kg', speed:'1.0 m/s', installationDate:'Jan 15, 2025', warrantyExpiry:'Jan 14, 2026', status:'Operational' },
    { elevatorId:'ELX-BLR-000125', site:'XYZ Complex',    customer:'XYZ Limited',        building:'Tower 1',    type:'Passenger',    capacity:'2000 kg', speed:'1.5 m/s', installationDate:'Feb 10, 2025', warrantyExpiry:'Feb 09, 2026', status:'Operational' },
    { elevatorId:'ELX-BLR-000126', site:'Tech Park',      customer:'Tech Solutions',     building:'Main Block', type:'Goods',        capacity:'3000 kg', speed:'0.5 m/s', installationDate:'Mar 01, 2025', warrantyExpiry:'Pending',       status:'Testing' },
    { elevatorId:'ELX-BLR-000127', site:'Central Mall',   customer:'Central Retail',     building:'South Wing', type:'Passenger',    capacity:'1500 kg', speed:'1.0 m/s', installationDate:'Jan 20, 2025', warrantyExpiry:'Jan 19, 2026', status:'Breakdown' },
    { elevatorId:'ELX-BLR-000128', site:'Metro Heights',  customer:'Metro Developments', building:'Tower 2',    type:'Passenger',    capacity:'2500 kg', speed:'1.5 m/s', installationDate:'Feb 20, 2025', warrantyExpiry:'Feb 19, 2026', status:'Operational' },
    { elevatorId:'ELX-BLR-000129', site:'Green Residency',customer:'Green Valley Builders',building:'Main',     type:'Residential',  capacity:'1600 kg', speed:'1.0 m/s', installationDate:'Mar 10, 2025', warrantyExpiry:'Pending',       status:'Maintenance' },
  ]);

  // Technicians
  await Technician.insertMany([
    { techId:'TECH-001', name:'John Sharma',  mobile:'98765-43210', location:'Mumbai',    zone:'West',  skills:'Installation, Repair',        jobsCompleted:42, rating:4.8, status:'Available' },
    { techId:'TECH-002', name:'Priya Kumar',  mobile:'99876-54321', location:'Bangalore', zone:'South', skills:'Testing, Commissioning',       jobsCompleted:38, rating:4.7, status:'Available' },
    { techId:'TECH-003', name:'Raj Patel',    mobile:'97654-32109', location:'Pune',      zone:'West',  skills:'Maintenance, Repair',          jobsCompleted:32, rating:4.6, status:'Available' },
    { techId:'TECH-004', name:'Anita Singh',  mobile:'96543-21098', location:'Delhi',     zone:'North', skills:'All Skills',                   jobsCompleted:29, rating:4.9, status:'On Assignment' },
    { techId:'TECH-005', name:'Vikram Reddy', mobile:'95432-10987', location:'Hyderabad', zone:'South', skills:'Installation, Testing',        jobsCompleted:36, rating:4.5, status:'On Assignment' },
    { techId:'TECH-006', name:'Neha Gupta',   mobile:'94321-09876', location:'Chennai',   zone:'South', skills:'Maintenance, Service',         jobsCompleted:27, rating:4.4, status:'Available' },
  ]);

  // Breakdowns — assign first 2 tickets to tech1 (Anita Singh) so 'own' scope works
  await Breakdown.insertMany([
    { ticketId:'#TKT-001456', customer:'ABC Corporation',   site:'ABC Tower',    elevatorId:'ELX-BLR-000124', complaint:'Elevator Breakdown', priority:'CRITICAL', technician:'Anita Singh',  slaHours:4,  status:'In Progress', assignedUsers:[uTech._id] },
    { ticketId:'#TKT-001455', customer:'Tech Solutions',    site:'Tech Park',    elevatorId:'ELX-BLR-000126', complaint:'Door Lock Issue',     priority:'HIGH',     technician:'Anita Singh',  slaHours:8,  status:'Assigned',     assignedUsers:[uTech._id] },
    { ticketId:'#TKT-001454', customer:'Central Retail',    site:'Central Mall', elevatorId:'ELX-BLR-000127', complaint:'Levelling Issue',     priority:'MEDIUM',   technician:'Raj Patel',    slaHours:24, status:'Pending',      assignedUsers:[] },
    { ticketId:'#TKT-001453', customer:'XYZ Limited',       site:'XYZ Complex',  elevatorId:'ELX-BLR-000125', complaint:'Noise Issue',         priority:'LOW',      technician:'John Sharma',  slaHours:48, status:'Pending',      assignedUsers:[] },
    { ticketId:'#TKT-001452', customer:'Metro Developments', site:'Metro Heights',elevatorId:'ELX-BLR-000128', complaint:'Controller Fault',    priority:'HIGH',     technician:'Vikram Reddy', slaHours:8,  status:'In Progress',  assignedUsers:[] },
  ]);

  // Maintenance — assign 2 tasks to tech1 so 'own' scope works
  await Maintenance.insertMany([
    { maintenanceId:'MNT-0001', elevatorId:'ELX-BLR-000124', customer:'ABC Corporation',   site:'ABC Tower',    schedule:'Monthly',   dueDate:'Oct 15, 2025', technician:'Anita Singh',  type:'Routine',   status:'Completed',   assignedUsers:[uTech._id] },
    { maintenanceId:'MNT-0002', elevatorId:'ELX-BLR-000125', customer:'XYZ Limited',       site:'XYZ Complex',  schedule:'Monthly',   dueDate:'Oct 10, 2025', technician:'Anita Singh',  type:'Routine',   status:'In Progress', assignedUsers:[uTech._id] },
    { maintenanceId:'MNT-0003', elevatorId:'ELX-BLR-000126', customer:'Tech Solutions',    site:'Tech Park',    schedule:'Quarterly', dueDate:'Oct 05, 2025', technician:'Raj Patel',    type:'Intensive', status:'Pending',     assignedUsers:[] },
    { maintenanceId:'MNT-0004', elevatorId:'ELX-BLR-000128', customer:'Metro Developments', site:'Metro Heights',schedule:'Monthly',  dueDate:'Oct 20, 2025', technician:'Vikram Reddy', type:'Routine',   status:'Scheduled',   assignedUsers:[] },
  ]);

  // Installations
  await Installation.insertMany([
    { installationId:'INST-001', elevatorId:'ELX-BLR-000124', customer:'ABC Corporation',    site:'ABC Tower',    startDate:'Jan 15, 2025', targetDate:'Mar 15, 2025', progress:100, supervisor:'John Sharma',  status:'Completed' },
    { installationId:'INST-002', elevatorId:'ELX-BLR-000125', customer:'XYZ Limited',        site:'XYZ Complex',  startDate:'Feb 10, 2025', targetDate:'Apr 10, 2025', progress:100, supervisor:'Anita Singh',  status:'Completed' },
    { installationId:'INST-003', elevatorId:'ELX-BLR-000126', customer:'Tech Solutions',     site:'Tech Park',    startDate:'Mar 01, 2025', targetDate:'Apr 15, 2025', progress:65,  supervisor:'John Sharma',  status:'In Progress' },
    { installationId:'INST-004', elevatorId:'ELX-BLR-000128', customer:'Metro Developments', site:'Metro Heights',startDate:'Feb 15, 2025', targetDate:'Apr 30, 2025', progress:45,  supervisor:'Priya Kumar',  status:'In Progress' },
  ]);

  // Surveys
  await Survey.insertMany([
    { surveyId:'SRV-001', project:'ABC Corp HQ',      site:'Nariman Point, Mumbai',  customer:'ABC Corporation',    type:'Pre-Installation', engineer:'Rajesh Kumar',  date:'Oct 15, 2025', findings:'Site ready, shaft dimensions verified',    status:'Completed' },
    { surveyId:'SRV-002', project:'Tech Park B',      site:'Whitefield, Bangalore',  customer:'Tech Solutions',     type:'Pre-Installation', engineer:'Anita Sharma',  date:'Oct 18, 2025', findings:'Electrical panel upgrade required',          status:'In Progress' },
    { surveyId:'SRV-003', project:'Luxury Residency', site:'Bandra, Mumbai',         customer:'Metro Developments', type:'Site Inspection',  engineer:'Vikram Nair',   date:'Oct 20, 2025', findings:'-',                                         status:'Scheduled' },
    { surveyId:'SRV-004', project:'Central Mall',     site:'Lajpat Nagar, Delhi',    customer:'Central Retail',     type:'Feasibility Study',engineer:'Priya Patel',   date:'Oct 12, 2025', findings:'Load-bearing walls adequate',               status:'Completed' },
  ]);

  // Purchase Orders
  await PurchaseOrder.insertMany([
    { poNumber:'PO-2025-001', vendor:'Otis Components Ltd',  project:'ABC Corp HQ',     items:'Drive Unit, Control Panel',      amount:'₹4,25,000', orderDate:'Oct 10, 2025', deliveryDate:'Oct 25, 2025', status:'Approved' },
    { poNumber:'PO-2025-002', vendor:'Schindler Parts',      project:'Tech Park B',     items:'Guide Rails, Buffers',           amount:'₹1,85,000', orderDate:'Oct 12, 2025', deliveryDate:'Oct 28, 2025', status:'Pending' },
    { poNumber:'PO-2025-003', vendor:'Local Steel Works',    project:'Hospital Block C',items:'Cabin Panels, Door Frames',      amount:'₹2,10,000', orderDate:'Oct 08, 2025', deliveryDate:'Oct 20, 2025', status:'Delivered' },
    { poNumber:'PO-2025-004', vendor:'Electric Supplies Co', project:'Luxury Residency',items:'Motor, Cables, Switches',        amount:'₹3,60,000', orderDate:'Oct 15, 2025', deliveryDate:'Nov 01, 2025', status:'In Transit' },
    { poNumber:'PO-2025-005', vendor:'Safety Equipment Hub', project:'Central Mall',    items:'Safety Sensors, ARD Kit',        amount:'₹95,000',   orderDate:'Oct 18, 2025', deliveryDate:'Oct 30, 2025', status:'Draft' },
  ]);

  // QA Records
  await QARecord.insertMany([
    { qaId:'QA-001', project:'ABC Corp HQ',      elevatorId:'ELX-BLR-000124', customer:'ABC Corporation',    type:'Final Testing',  inspector:'Rajesh Kumar', date:'Oct 16, 2025', score:'95/100', status:'Passed' },
    { qaId:'QA-002', project:'Tech Park B',      elevatorId:'ELX-BLR-000126', customer:'Tech Solutions',     type:'Load Testing',   inspector:'Anita Sharma', date:'Oct 19, 2025', score:'88/100', status:'Passed' },
    { qaId:'QA-003', project:'Hospital Block C', elevatorId:'ELX-BLR-000128', customer:'Metro Developments', type:'Safety Check',   inspector:'Vikram Nair',  date:'Oct 21, 2025', score:'-',      status:'Scheduled' },
    { qaId:'QA-004', project:'Central Mall',     elevatorId:'ELX-BLR-000127', customer:'Central Retail',     type:'Commissioning',  inspector:'Priya Patel',  date:'Oct 14, 2025', score:'72/100', status:'Failed' },
  ]);

  // Handovers
  await Handover.insertMany([
    { handoverId:'HO-001', project:'ABC Corp HQ',      customer:'ABC Corporation',    elevators:2, handoverDate:'Oct 17, 2025', acceptedBy:'Rajan Mehta (GM)', docs:['Completion Certificate','O&M Manual','Warranty Card'], status:'Completed' },
    { handoverId:'HO-002', project:'Tech Park B',      customer:'Tech Solutions',     elevators:3, handoverDate:'Oct 25, 2025', acceptedBy:'Pending',          docs:[], status:'Scheduled' },
    { handoverId:'HO-003', project:'Luxury Residency', customer:'Metro Developments', elevators:4, handoverDate:'Nov 05, 2025', acceptedBy:'Pending',          docs:[], status:'Pending' },
    { handoverId:'HO-004', project:'Luxury Residency', customer:'Metro Developments', elevators:6, handoverDate:'Oct 10, 2025', acceptedBy:'Arvind Shah (MD)',  docs:['Completion Certificate','O&M Manual','Warranty Card','AMC Agreement'], status:'Completed' },
  ]);

  // Documents
  await Document.insertMany([
    { docId:'DOC-001', name:'ABC Corp - Completion Certificate.pdf',    category:'Completion Certificate', project:'ABC Corp HQ',      customer:'ABC Corporation', uploadedBy:'Rajesh Kumar', fileSize:'245 KB', status:'Active' },
    { docId:'DOC-002', name:'Tech Park B - Engineering Drawings.dwg',   category:'Engineering Drawing',    project:'Tech Park B',      customer:'Tech Solutions',  uploadedBy:'Anita Sharma', fileSize:'3.2 MB', status:'Active' },
    { docId:'DOC-003', name:'Hospital Block C - O&M Manual.pdf',        category:'O&M Manual',             project:'Hospital Block C', customer:'Metro Developments', uploadedBy:'Vikram Nair', fileSize:'1.8 MB', status:'Active' },
    { docId:'DOC-004', name:'Luxury Residency - Warranty Certificate.pdf',category:'Warranty',             project:'Luxury Residency', customer:'Metro Developments', uploadedBy:'Priya Patel', fileSize:'180 KB', status:'Active' },
    { docId:'DOC-005', name:'Central Mall - AMC Agreement.pdf',          category:'AMC Agreement',          project:'Central Mall',     customer:'Central Retail',  uploadedBy:'Suresh Rao',  fileSize:'520 KB', status:'Expired' },
    { docId:'DOC-006', name:'ELV-2024-001 Inspection Report.pdf',        category:'Inspection Report',      project:'ABC Corp HQ',      customer:'ABC Corporation', uploadedBy:'Rajesh Kumar', fileSize:'312 KB', status:'Active' },
  ]);

  // Approvals
  await Approval.insertMany([
    { approvalId:'APR-001', type:'Purchase Order',   reference:'PO-2025-001', description:'Drive Unit & Control Panel — ₹4,25,000', requestedBy:'Rajesh Kumar', priority:'HIGH',   currentLevel:'Project Manager → Management', status:'Pending' },
    { approvalId:'APR-002', type:'Leave Request',    reference:'LVE-2025-045', description:'Annual leave 25–29 Oct (Anita Sharma)',  requestedBy:'Anita Sharma', priority:'MEDIUM', currentLevel:'Completed',                    status:'Approved' },
    { approvalId:'APR-003', type:'Expense Claim',    reference:'EXP-2025-089', description:'Site travel expenses ₹8,500',            requestedBy:'Vikram Nair',  priority:'LOW',    currentLevel:'Project Manager',              status:'Pending' },
    { approvalId:'APR-004', type:'Contract Change',  reference:'CHG-2025-012', description:'Scope addition: 2 extra floors Tech Park B', requestedBy:'Priya Patel', priority:'HIGH',   currentLevel:'Management → Super Admin',     status:'In Review' },
    { approvalId:'APR-005', type:'Customer Discount',reference:'DIS-2025-007', description:'15% AMC renewal discount for ABC Corp', requestedBy:'Sales Team',   priority:'LOW',    currentLevel:'Management',                   status:'Pending' },
  ]);

  // Notifications
  await Notification.insertMany([
    { type:'Critical', icon:'🆘', title:'Elevator Breakdown',   message:'ELX-BLR-000127 at Central Mall is non-operational.',          module:'Breakdown',    read:false },
    { type:'Warning',  icon:'⚠️', title:'AMC Expiry Alert',     message:'ABC Corp AMC contract expires in 15 days.',                   module:'Warranty & AMC', read:false },
    { type:'Warning',  icon:'⚠️', title:'Maintenance Due',      message:'4 elevators have preventive maintenance due this week.',       module:'Maintenance',  read:false },
    { type:'Info',     icon:'✅', title:'Handover Completed',   message:'Project "ABC Corp HQ" successfully handed over.',              module:'Handover',     read:true },
    { type:'Info',     icon:'📋', title:'PO Awaiting Approval', message:'PO-2025-001 (₹4,25,000) requires your approval.',             module:'Procurement',  read:false },
    { type:'Critical', icon:'🔒', title:'Security Alert',       message:'Multiple failed login attempts detected from IP 45.23.189.77.',module:'Security',     read:true },
  ]);

  // Spare Parts
  await SparePart.insertMany([
    { partId:'PART-001', partName:'Door Motor',           category:'Door Components', stock:45, minStock:20, costPerUnit:'15,000', supplier:'Tech Motors',      status:'In Stock' },
    { partId:'PART-002', partName:'Controller Unit',      category:'Electronics',     stock:12, minStock:10, costPerUnit:'35,000', supplier:'Electrical Pro',   status:'Low Stock' },
    { partId:'PART-003', partName:'Safety Valve',         category:'Safety',          stock:0,  minStock:15, costPerUnit:'8,500',  supplier:'Safety Tech',      status:'Out of Stock' },
    { partId:'PART-004', partName:'Guide Rail (2m)',       category:'Structural',      stock:120,minStock:50, costPerUnit:'12,000', supplier:'Steel Supply Co',  status:'In Stock' },
    { partId:'PART-005', partName:'Brake Pad Set',         category:'Mechanical',      stock:34, minStock:15, costPerUnit:'5,200',  supplier:'Brake Experts',    status:'In Stock' },
    { partId:'PART-006', partName:'Cabin Panel (Stainless)',category:'Cabin',          stock:8,  minStock:12, costPerUnit:'22,000', supplier:'Stainless Ltd',    status:'Low Stock' },
  ]);

  // Warranty / AMC
  await Warranty.insertMany([
    { warrantyId:'WR-001', elevatorId:'ELX-BLR-000124', customer:'ABC Corporation', site:'ABC Tower',   amcStart:'Jan 15, 2025', amcEnd:'Jan 14, 2026', type:'Comprehensive', coverage:'24/7', value:'2,50,000', status:'Active' },
    { warrantyId:'WR-002', elevatorId:'ELX-BLR-000125', customer:'XYZ Limited',     site:'XYZ Complex', amcStart:'Feb 10, 2025', amcEnd:'Feb 09, 2026', type:'Standard',      coverage:'Business Hours', value:'1,80,000', status:'Active' },
    { warrantyId:'WR-003', elevatorId:'ELX-BLR-000085', customer:'Central Retail',  site:'Central Mall',amcStart:'Jan 15, 2024', amcEnd:'Jan 14, 2025', type:'Comprehensive', coverage:'24/7', value:'2,50,000', status:'Expired' },
    { warrantyId:'WR-004', elevatorId:'ELX-BLR-000128', customer:'Metro Developments',site:'Metro Heights',amcStart:'Mar 01, 2025',amcEnd:'Nov 30, 2025', type:'Basic',       coverage:'Business Hours', value:'1,20,000', status:'Expiring Soon' },
  ]);

  // Testing
  await Testing.insertMany([
    { testId:'TEST-001', elevatorId:'ELX-BLR-000124', customer:'ABC Corporation', site:'ABC Tower',   testDate:'Jan 14, 2025', mechanical:'Pass', electrical:'Pass', safety:'Pass', inspector:'Rajesh Kumar', status:'Completed' },
    { testId:'TEST-002', elevatorId:'ELX-BLR-000125', customer:'XYZ Limited',     site:'XYZ Complex', testDate:'Feb 09, 2025', mechanical:'Pass', electrical:'Pass', safety:'Pass', inspector:'Anita Singh',  status:'Completed' },
    { testId:'TEST-003', elevatorId:'ELX-BLR-000126', customer:'Tech Solutions',  site:'Tech Park',   testDate:'Scheduled',    mechanical:'-',    electrical:'-',    safety:'-',    inspector:'Priya Kumar',  status:'Pending' },
  ]);

  // Audit Logs (initial)
  await AuditLog.insertMany([
    { user:'Admin User', role:'Super Admin', action:'System Initialized', module:'System', target:'elevatorX v2 backend seeded', severity:'Info' },
  ]);

  console.log('All seed data inserted successfully!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
