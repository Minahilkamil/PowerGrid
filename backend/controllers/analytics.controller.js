import UsageAnalytics from '../models/UsageAnalytics.js';
import Consumer from '../models/Consumer.js';
import Bill from '../models/Bill.js';

// @desc    Get usage analytics for a consumer
// @route   GET /api/analytics/me
// @access  Private/Consumer
export const getMyAnalytics = async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    const analytics = await UsageAnalytics.find({ consumer: consumer._id })
      .sort({ date: -1 })
      .limit(30);

    // Also get last 12 months bills for comparison
    const bills = await Bill.find({ consumer: consumer._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.status(200).json({
      success: true,
      data: {
        dailyUsage: analytics.reverse(),
        billingHistory: bills.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed random analytics data (for demo/development)
// @route   POST /api/analytics/seed
// @access  Private/Admin
export const seedAnalytics = async (req, res, next) => {
  try {
    const consumers = await Consumer.find();
    
    for (const consumer of consumers) {
      // Create 30 days of data
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const hourlyUsage = [];
        let dailyTotal = 0;
        for (let h = 0; h < 24; h++) {
          // Peak hours 6 PM to 11 PM
          const isPeak = h >= 18 && h <= 23;
          const units = isPeak ? Math.random() * 2 + 1 : Math.random() * 1;
          hourlyUsage.push({ hour: h, units: parseFloat(units.toFixed(2)) });
          dailyTotal += units;
        }

        await UsageAnalytics.create({
          consumer: consumer._id,
          date,
          hourlyUsage,
          dailyTotal: parseFloat(dailyTotal.toFixed(2)),
          peakHour: 20, // Example
          insights: ['Your usage is 10% higher than last week', 'Try using heavy appliances during off-peak hours']
        });
      }
    }

    res.status(200).json({ success: true, message: 'Analytics seeded' });
  } catch (error) {
    next(error);
  }
};
