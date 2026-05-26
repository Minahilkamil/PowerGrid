import mongoose from 'mongoose';

const usageAnalyticsSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    hourlyUsage: [{
      hour: { type: Number, min: 0, max: 23 },
      units: { type: Number, default: 0 }
    }],
    dailyTotal: {
      type: Number,
      default: 0
    },
    peakHour: {
      type: Number
    },
    abnormalUsage: {
      type: Boolean,
      default: false
    },
    insights: [String]
  },
  { timestamps: true }
);

const UsageAnalytics = mongoose.model('UsageAnalytics', usageAnalyticsSchema);
export default UsageAnalytics;
