import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Consumer from './models/Consumer.js';
import MeterReading from './models/MeterReading.js';
import Bill from './models/Bill.js';
import Payment from './models/Payment.js';
import Notification from './models/Notification.js';
import { calculateBill } from './utils/billCalculator.js';

const seed = async () => {
  await connectDB();

  // ── Wipe existing data ────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany(),
    Consumer.deleteMany(),
    MeterReading.deleteMany(),
    Bill.deleteMany(),
    Payment.deleteMany(),
    Notification.deleteMany(),
  ]);
  console.log('Cleared existing data.');

  // ── Admin user ────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@electricity.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  });
  console.log('Admin created:', admin.email);

  // ── Employee user ─────────────────────────────────────────────────────────
  const employee = await User.create({
    name: 'Field Employee',
    email: 'employee@electricity.com',
    password: 'emp123',
    role: 'employee',
    isActive: true,
  });
  console.log('Employee created:', employee.email);

  // ── Consumer users + Consumer records ─────────────────────────────────────
  const consumerData = [
    {
      user: { name: 'Ali Hassan', email: 'ali@example.com', password: '3520112345671' },
      profile: {
        fullName: 'Ali Hassan',
        cnic: '35201-1234567-1',
        email: 'ali@example.com',
        phone: '0300-1234567',
        address: 'House 12, Street 5, Lahore',
        area: 'Gulberg',
        consumerId: 'CON-001',
        meterNumber: 'MTR-001',
        connectionType: 'residential',
      },
    },
    {
      user: { name: 'Sara Khan', email: 'sara@example.com', password: '4220298765432' },
      profile: {
        fullName: 'Sara Khan',
        cnic: '42202-9876543-2',
        email: 'sara@example.com',
        phone: '0321-9876543',
        address: 'Shop 3, Commercial Area, Karachi',
        area: 'DHA Phase 5',
        consumerId: 'CON-002',
        meterNumber: 'MTR-002',
        connectionType: 'commercial',
      },
    },
    {
      user: { name: 'Usman Malik', email: 'usman@example.com', password: '3740355566773' },
      profile: {
        fullName: 'Usman Malik',
        cnic: '37403-5556677-3',
        email: 'usman@example.com',
        phone: '0333-5556677',
        address: 'Industrial Zone B, Faisalabad',
        area: 'West Canal Road',
        consumerId: 'CON-003',
        meterNumber: 'MTR-003',
        connectionType: 'industrial',
      },
    },
  ];

  const consumers = [];
  for (const cd of consumerData) {
    const user = await User.create({ ...cd.user, role: 'consumer', isActive: true });
    const consumer = await Consumer.create({
      ...cd.profile,
      user: user._id,
      createdBy: admin._id,
      installationDate: new Date('2023-01-15'),
      status: 'active',
    });
    consumers.push(consumer);
    console.log('Consumer created:', consumer.fullName, '|', consumer.meterNumber);
  }

  // ── Meter readings (last 4 months for each consumer) ─────────────────────
  const now = new Date();
  const months = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }

  // Starting readings per consumer
  const startReadings = [1000, 5000, 20000];
  const monthlyUnits = [
    [80, 150, 350, 120],   // Ali: low, medium, high, pending
    [200, 280, 320, 250],  // Sara: medium-high, pending
    [500, 650, 800, 700],  // Usman: industrial, pending
  ];

  const allReadings = [];
  for (let ci = 0; ci < consumers.length; ci++) {
    let prev = startReadings[ci];
    for (let mi = 0; mi < months.length; mi++) {
      const units = monthlyUnits[ci][mi];
      const current = prev + units;
      const reading = await MeterReading.create({
        consumer: consumers[ci]._id,
        meterNumber: consumers[ci].meterNumber,
        previousReading: prev,
        currentReading: current,
        readingDate: new Date(months[mi].year, months[mi].month - 1, 10),
        month: months[mi].month,
        year: months[mi].year,
        recordedBy: employee._id,
        notes: 'Seeded reading',
      });
      allReadings.push(reading);
      prev = current;
    }
  }
  console.log(`Created ${allReadings.length} meter readings.`);

  // ── Bills for all readings ────────────────────────────────────────────────
  const allBills = [];
  for (const reading of allReadings) {
    const { baseAmount, fuelAdjustment, serviceTax, meterRent, totalAmount } =
      calculateBill(reading.unitsConsumed);

    const dueDate = new Date(reading.readingDate);
    dueDate.setDate(dueDate.getDate() + 15);

    // Mark older bills as paid, latest as pending
    const isLatest =
      reading.month === months[3].month && reading.year === months[3].year;

    const bill = await Bill.create({
      consumer: reading.consumer,
      meterReading: reading._id,
      meterNumber: reading.meterNumber,
      month: reading.month,
      year: reading.year,
      unitsConsumed: reading.unitsConsumed,
      baseAmount,
      fuelAdjustment,
      serviceTax,
      meterRent,
      lateFee: 0,
      totalAmount,
      status: isLatest ? 'pending' : 'paid',
      dueDate,
      paidDate: isLatest ? undefined : new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      generatedBy: admin._id,
    });
    allBills.push(bill);
  }
  console.log(`Created ${allBills.length} bills.`);

  // ── Payments for paid bills ───────────────────────────────────────────────
  const paidBills = allBills.filter((b) => b.status === 'paid');
  const paymentMethods = ['bank_transfer', 'easypaisa', 'jazzcash', 'credit_card'];
  let paymentCount = 0;

  for (const bill of paidBills) {
    const method = paymentMethods[paymentCount % paymentMethods.length];
    await Payment.create({
      bill: bill._id,
      consumer: bill.consumer,
      amount: bill.totalAmount,
      paymentMethod: method,
      status: 'success',
      paymentDate: bill.paidDate,
      processedBy: admin._id,
    });
    paymentCount++;
  }
  console.log(`Created ${paymentCount} payments.`);

  // ── Sample notifications ──────────────────────────────────────────────────
  const notifData = [
    {
      consumer: consumers[0]._id,
      title: 'Bill Generated',
      message: 'Your latest electricity bill has been generated.',
      type: 'bill_generated',
    },
    {
      consumer: consumers[1]._id,
      title: 'Payment Reminder',
      message: 'Your bill is due in 3 days. Please pay to avoid late fees.',
      type: 'payment_reminder',
    },
    {
      consumer: consumers[2]._id,
      title: 'Payment Successful',
      message: 'Your payment has been received. Thank you!',
      type: 'payment_success',
      isRead: true,
    },
  ];

  await Notification.insertMany(notifData);
  console.log('Created sample notifications.');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completed successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Admin    → admin@electricity.com    / admin123');
  console.log('  Employee → employee@electricity.com / emp123');
  console.log('  Consumer → ali@example.com          / 3520112345671');
  console.log('  Consumer → sara@example.com         / 4220298765432');
  console.log('  Consumer → usman@example.com        / 3740355566773');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
