import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentSchema = new mongoose.Schema(
  {
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: true,
    },
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'easypaisa', 'jazzcash'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-generate transactionId and receiptNumber before saving
paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  if (!this.receiptNumber) {
    this.receiptNumber = 'RCP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
