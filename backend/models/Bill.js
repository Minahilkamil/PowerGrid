import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: true,
    },
    meterReading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeterReading',
      required: true,
    },
    meterNumber: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    unitsConsumed: {
      type: Number,
      required: true,
      min: 0,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelAdjustment: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceTax: {
      type: Number,
      required: true,
      min: 0,
    },
    meterRent: {
      type: Number,
      required: true,
      default: 50,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
