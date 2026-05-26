import { Router } from 'express';
import SupportTicket from '../models/SupportTicket.js';
import Consumer from '../models/Consumer.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Consumer: create ticket
router.post('/', authorize('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    const ticket = await SupportTicket.create({ ...req.body, consumer: consumer?._id });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { next(err); }
});

// Consumer: get own tickets
router.get('/me', authorize('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    const tickets = await SupportTicket.find({ consumer: consumer?._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) { next(err); }
});

// Consumer: add response to own ticket
router.post('/:id/respond', authorize('consumer'), async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { responses: { authorName: req.user.name, message: req.body.message, isStaff: false } } },
      { new: true }
    );
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
});

// Admin/Employee: get all tickets
router.get('/', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [data, total] = await Promise.all([
      SupportTicket.find(filter).populate('consumer', 'fullName email').skip((page-1)*limit).limit(limit).sort({ createdAt: -1 }),
      SupportTicket.countDocuments(filter),
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total/limit), data });
  } catch (err) { next(err); }
});

// Admin/Employee: update ticket + add staff response
router.put('/:id', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const { status, response } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (status === 'resolved') updates.resolvedAt = new Date();
    if (response) updates.$push = { responses: { author: req.user._id, authorName: req.user.name, message: response, isStaff: true } };
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
});

export default router;
