import Complaint from '../models/Complaint.js';
import Consumer from '../models/Consumer.js';

// @desc    Register a new complaint
// @route   POST /api/complaints
// @access  Private/Consumer
export const registerComplaint = async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    const { title, description, category, priority, images } = req.body;

    const complaint = await Complaint.create({
      consumer: consumer._id,
      title,
      description,
      category,
      priority,
      images,
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consumer's own complaints
// @route   GET /api/complaints/me
// @access  Private/Consumer
export const getMyComplaints = async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    const complaints = await Complaint.find({ consumer: consumer._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Admin/Employee)
// @route   GET /api/complaints
// @access  Private/Admin|Employee
export const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const complaints = await Complaint.find(filter)
      .populate('consumer', 'fullName meterNumber phone')
      .populate('assignedTo', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status/resolution
// @route   PUT /api/complaints/:id
// @access  Private/Admin|Employee
export const updateComplaint = async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNotes, expectedResolutionTime } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
    if (expectedResolutionTime) updates.expectedResolutionTime = expectedResolutionTime;
    
    if (status === 'Resolved') {
      updates.resolvedAt = Date.now();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('consumer', 'fullName email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
