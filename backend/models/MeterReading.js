import mongoose from 'mongoose';

const meterReadingSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: true,
    },
    meterNumber: {
      type: String,
      required: [true, 'Meter number is required'],
      trim: true,
    },
    previousReading: {
      type: Number,
      required: [true, 'Previous reading is required'],
      min: [0, 'Reading cannot be negative'],
    },
    currentReading: {
      type: Number,
      required: [true, 'Current reading is required'],
      min: [0, 'Reading cannot be negative'],
    },
    unitsConsumed: {
      type: Number,
      min: [0, 'Units consumed cannot be negative'],
    },
    readingDate: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate units consumed before saving
meterReadingSchema.pre('save', function (next) {
  if (this.isModified('currentReading') || this.isModified('previousReading')) {
    this.unitsConsumed = Math.max(0, this.currentReading - this.previousReading);
  }
  next();
});

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);
export default MeterReading;
