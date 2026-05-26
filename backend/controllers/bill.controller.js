import Bill from '../models/Bill.js';
import MeterReading from '../models/MeterReading.js';
import Consumer from '../models/Consumer.js';
import { calculateBill, LATE_FEE } from '../utils/billCalculator.js';
import sendNotification from '../utils/sendNotification.js';

// @desc    Generate a bill from a meter reading
// @route   POST /api/bills/generate
// @access  Private/Admin|Employee
export const generateBill = async (req, res, next) => {
  try {
    const { readingId, dueDate } = req.body;

    const reading = await MeterReading.findById(readingId).populate('consumer');
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Meter reading not found' });
    }

    // Prevent duplicate bill for same reading
    const existingBill = await Bill.findOne({ meterReading: readingId });
    if (existingBill) {
      return res.status(400).json({ success: false, message: 'Bill already generated for this reading' });
    }

    const { baseAmount, fuelAdjustment, serviceTax, meterRent, totalAmount } =
      calculateBill(reading.unitsConsumed);

    const billDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now

    const bill = await Bill.create({
      consumer: reading.consumer._id,
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
      status: 'pending',
      dueDate: billDueDate,
      generatedBy: req.user._id,
    });

    // Send notification to consumer
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    await sendNotification(
      reading.consumer._id,
      'New Bill Generated',
      `Your electricity bill for ${monthNames[reading.month - 1]} ${reading.year} has been generated. Amount due: PKR ${totalAmount}. Due date: ${billDueDate.toDateString()}.`,
      'bill_generated'
    );

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills (paginated + filterable)
// @route   GET /api/bills
// @access  Private/Admin|Employee
export const getBills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) filter.month = parseInt(req.query.month, 10);
    if (req.query.year) filter.year = parseInt(req.query.year, 10);
    if (req.query.consumer) filter.consumer = req.query.consumer;
    if (req.query.meterNumber) filter.meterNumber = req.query.meterNumber;

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('consumer', 'fullName meterNumber email')
        .populate('generatedBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Bill.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
export const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('consumer', 'fullName meterNumber email phone address cnic connectionType')
      .populate('meterReading', 'previousReading currentReading readingDate')
      .populate('generatedBy', 'name');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bills for a specific consumer
// @route   GET /api/bills/consumer/:consumerId
// @access  Private
export const getConsumerBills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { consumer: req.params.consumerId };
    if (req.query.status) filter.status = req.query.status;

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ year: -1, month: -1 }),
      Bill.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark overdue bills (bills past due date that are still pending)
// @route   PUT /api/bills/mark-overdue
// @access  Private/Admin|Employee
export const markOverdue = async (req, res, next) => {
  try {
    const now = new Date();

    const result = await Bill.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      {
        $set: { status: 'overdue' },
        $inc: { lateFee: LATE_FEE, totalAmount: LATE_FEE },
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} bill(s) marked as overdue`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bill data formatted for PDF generation
// @route   GET /api/bills/:id/download
// @access  Private
export const downloadBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('consumer', 'fullName meterNumber email phone address cnic connectionType installationDate')
      .populate('meterReading', 'previousReading currentReading readingDate')
      .populate('generatedBy', 'name');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const billData = {
      billId: bill._id,
      billNumber: `BILL-${bill.year}-${String(bill.month).padStart(2, '0')}-${bill._id.toString().slice(-6).toUpperCase()}`,
      consumer: {
        name: bill.consumer.fullName,
        cnic: bill.consumer.cnic,
        email: bill.consumer.email,
        phone: bill.consumer.phone,
        address: bill.consumer.address,
        meterNumber: bill.consumer.meterNumber,
        connectionType: bill.consumer.connectionType,
      },
      billing: {
        month: monthNames[bill.month - 1],
        year: bill.year,
        previousReading: bill.meterReading?.previousReading,
        currentReading: bill.meterReading?.currentReading,
        readingDate: bill.meterReading?.readingDate,
        unitsConsumed: bill.unitsConsumed,
      },
      charges: {
        baseAmount: bill.baseAmount,
        fuelAdjustment: bill.fuelAdjustment,
        serviceTax: bill.serviceTax,
        meterRent: bill.meterRent,
        lateFee: bill.lateFee,
        totalAmount: bill.totalAmount,
      },
      status: bill.status,
      dueDate: bill.dueDate,
      paidDate: bill.paidDate,
      generatedAt: bill.createdAt,
    };

    res.status(200).json({ success: true, data: billData });
  } catch (error) {
    next(error);
  }
};
