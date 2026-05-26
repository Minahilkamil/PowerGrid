import Notification from '../models/Notification.js';
import Consumer from '../models/Consumer.js';

// Helper: get consumer ID for the requesting user
const getConsumerId = async (req) => {
  if (req.user.role === 'consumer') {
    const consumer = await Consumer.findOne({ user: req.user._id }).select('_id');
    return consumer?._id;
  }
  return req.params.consumerId || req.query.consumerId;
};

// @desc    Get notifications for a consumer
// @route   GET /api/notifications
// @access  Private/Consumer
export const getNotifications = async (req, res, next) => {
  try {
    const consumerId = await getConsumerId(req);
    if (!consumerId) {
      return res.status(400).json({ success: false, message: 'Consumer not found' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { consumer: consumerId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Consumer
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for a consumer
// @route   PUT /api/notifications/read-all
// @access  Private/Consumer
export const markAllRead = async (req, res, next) => {
  try {
    const consumerId = await getConsumerId(req);
    if (!consumerId) {
      return res.status(400).json({ success: false, message: 'Consumer not found' });
    }

    const result = await Notification.updateMany(
      { consumer: consumerId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private/Consumer
export const getUnreadCount = async (req, res, next) => {
  try {
    const consumerId = await getConsumerId(req);
    if (!consumerId) {
      return res.status(400).json({ success: false, message: 'Consumer not found' });
    }

    const count = await Notification.countDocuments({ consumer: consumerId, isRead: false });

    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    next(error);
  }
};
