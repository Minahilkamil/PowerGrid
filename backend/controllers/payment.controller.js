import Payment from '../models/Payment.js';
import Bill from '../models/Bill.js';
import Consumer from '../models/Consumer.js';
import sendNotification from '../utils/sendNotification.js';

// @desc    Process a payment for a bill
// @route   POST /api/payments
// @access  Private
export const processPayment = async (req, res, next) => {
  try {
    const { billId, paymentMethod, cardDetails } = req.body;

    const bill = await Bill.findById(billId).populate('consumer');
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Bill is already paid' });
    }

    // Mock payment processing logic
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const receiptNumber = `REC-${Date.now().toString().substr(-6)}`;

    // Create payment record
    const payment = await Payment.create({
      bill: bill._id,
      consumer: bill.consumer._id,
      amount: bill.totalAmount,
      paymentMethod,
      transactionId,
      receiptNumber,
      status: 'success',
      paymentDate: new Date(),
      processedBy: req.user._id,
      // Mocking card details storage (only last 4 digits for security)
      ...(paymentMethod === 'card' && cardDetails && {
        metadata: {
          cardLast4: cardDetails.number.slice(-4),
          cardHolder: cardDetails.name
        }
      })
    });

    // Update bill status
    bill.status = 'paid';
    bill.paidDate = new Date();
    await bill.save();

    // Send success notification
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    await sendNotification(
      bill.consumer._id,
      'Payment Successful',
      `Your payment of PKR ${bill.totalAmount} for ${monthNames[bill.month - 1]} ${bill.year} bill has been received. Receipt: ${payment.receiptNumber}.`,
      'payment_success'
    );

    const populatedPayment = await Payment.findById(payment._id)
      .populate('bill', 'month year totalAmount meterNumber')
      .populate('consumer', 'fullName meterNumber email');

    res.status(201).json({ success: true, data: populatedPayment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (paginated)
// @route   GET /api/payments
// @access  Private/Admin|Employee
export const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.consumer) filter.consumer = req.query.consumer;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('consumer', 'fullName meterNumber email')
        .populate('bill', 'month year totalAmount')
        .populate('processedBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ paymentDate: -1 }),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments for a specific consumer
// @route   GET /api/payments/consumer/:consumerId
// @access  Private
export const getConsumerPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { consumer: req.params.consumerId };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('bill', 'month year totalAmount meterNumber status')
        .skip(skip)
        .limit(limit)
        .sort({ paymentDate: -1 }),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt with full details
// @route   GET /api/payments/:id/receipt
// @access  Private
export const getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'bill',
        select: 'month year totalAmount meterNumber baseAmount fuelAdjustment serviceTax meterRent lateFee unitsConsumed',
        populate: {
          path: 'meterReading',
          select: 'previousReading currentReading readingDate',
        },
      })
      .populate('consumer', 'fullName cnic email phone address meterNumber connectionType')
      .populate('processedBy', 'name');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const receipt = {
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      amount: payment.amount,
      consumer: payment.consumer,
      bill: {
        ...payment.bill.toObject(),
        monthName: monthNames[payment.bill.month - 1],
      },
      processedBy: payment.processedBy?.name || 'System',
    };

    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};
