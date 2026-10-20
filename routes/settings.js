const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

let settings = {
  // Company
  companyName: 'Samrudhya Elevators',
  companyEmail: 'info@samrudhya.com',
  companyPhone: '+91 98765 43210',

  // SLA
  maintenanceInterval: 30,
  slaHoursCritical: 4,
  slaHoursHigh: 8,
  slaHoursMedium: 24,
  slaHoursLow: 48,

  // Notifications
  emailNotifications: true,
  smsNotifications: true,

  // Business Hours
  workStartTime: '09:00',
  workEndTime: '18:00',
  workDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
  timezone: 'Asia/Kolkata',
  slaCalcMode: 'business_hours', // 'business_hours' | '24x7'

  // Escalation
  escalationL1Hours: 2,
  escalationL1Email: 'manager@samrudhya.com',
  escalationL2Hours: 6,
  escalationL2Email: 'director@samrudhya.com',
  escalationSmsAlert: true,

  // AMC / Contracts
  amcDefaultDurationMonths: 12,
  amcRenewalReminderDays: 30,
  amcGracePeriodDays: 15,
  warrantyDefaultMonths: 24,
  autoRenewAMC: false,

  // Billing & GST
  gstNumber: '29AAACS1234A1ZM',
  invoicePrefix: 'INV',
  paymentTermsDays: 30,
  bankName: 'HDFC Bank',
  bankAccountNumber: '',
  bankIFSC: '',
  currencySymbol: '₹',
};

router.get('/', auth, async (req, res) => {
  res.json(settings);
});

router.put('/', auth, async (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

module.exports = router;
