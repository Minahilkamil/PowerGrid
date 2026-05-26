import User from '../models/User.js';
import Consumer from '../models/Consumer.js';
import MeterReading from '../models/MeterReading.js';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import Complaint from '../models/Complaint.js';
import Outage from '../models/Outage.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalConsumers,
      pendingBills,
      paidBills,
      overdueBills,
      totalReadings,
      pendingComplaints,
      activeOutages,
      totalEmployees,
    ] = await Promise.all([
      Consumer.countDocuments(),
      Bill.countDocuments({ status: 'pending' }),
      Bill.countDocuments({ status: 'paid' }),
      Bill.countDocuments({ status: 'overdue' }),
      MeterReading.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Outage.countDocuments({ status: 'Active' }),
      User.countDocuments({ role: 'employee', isActive: true }),
    ]);

    // Total revenue from successful payments
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Monthly revenue — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Consumption trend — last 6 months
    const consumptionTrend = await MeterReading.aggregate([
      { $match: { readingDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalUnits: { $sum: '$unitsConsumed' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Payment status breakdown
    const paymentStatusBreakdown = {
      paid: paidBills,
      pending: pendingBills,
      overdue: overdueBills,
    };

    res.status(200).json({
      success: true,
      data: {
        totalConsumers,
        totalRevenue,
        pendingBills,
        paidBills,
        overdueBills,
        totalReadings,
        pendingComplaints,
        activeOutages,
        totalEmployees,
        monthlyRevenue,
        consumptionTrend,
        paymentStatusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent transactions
// @route   GET /api/admin/recent-transactions
// @access  Private/Admin
export const getRecentTransactions = async (req, res, next) => {
  try {
    const transactions = await Payment.find({ status: 'success' })
      .sort({ paymentDate: -1 })
      .limit(10)
      .populate({
        path: 'consumer',
        select: 'fullName meterNumber email',
      })
      .populate({
        path: 'bill',
        select: 'month year totalAmount',
      });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate a user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending employee applications
// @route   GET /api/admin/pending-employees
// @access  Private/Admin
export const getPendingEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', approvalStatus: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject an employee application
// @route   PUT /api/admin/employees/:id/approve
// @access  Private/Admin
export const approveEmployee = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
      user.isActive = true;
    } else {
      user.approvalStatus = 'rejected';
      user.isActive = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Employee ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
