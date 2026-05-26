import mongoose from 'mongoose';

const tariffSchema = new mongoose.Schema(
  {
    connectionType: {
      type: String,
      enum: ['residential', 'commercial', 'industrial'],
      required: true,
      unique: true,
    },
    peakRate: {
      type: Number,
      required: true,
      default: 0,
    },
    offPeakRate: {
      type: Number,
      required: true,
      default: 0,
    },
    fixedCharges: {
      type: Number,
      default: 0,
    },
    taxPercentage: {
      type: Number,
      default: 0,
    },
    lateFeePercentage: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const Tariff = mongoose.model('Tariff', tariffSchema);
export default Tariff;
