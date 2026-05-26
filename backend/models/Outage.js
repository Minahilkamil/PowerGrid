import mongoose from 'mongoose';

const outageSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['Scheduled', 'Emergency', 'Maintenance'],
      default: 'Scheduled',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
    },
    description: String,
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Outage = mongoose.model('Outage', outageSchema);
export default Outage;
