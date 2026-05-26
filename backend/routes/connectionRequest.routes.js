import { Router } from 'express';
import ConnectionRequest from '../models/ConnectionRequest.js';
import Consumer from '../models/Consumer.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Consumer: submit a request
router.post('/', authorize('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    const request = await ConnectionRequest.create({ ...req.body, consumer: consumer?._id });
    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
});

// Consumer: get own requests
router.get('/me', authorize('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findOne({ user: req.user._id });
    const requests = await ConnectionRequest.find({ consumer: consumer?._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});

// Admin/Employee: get all requests
router.get('/', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [data, total] = await Promise.all([
      ConnectionRequest.find(filter).populate('consumer', 'fullName meterNumber').skip((page-1)*limit).limit(limit).sort({ createdAt: -1 }),
      ConnectionRequest.countDocuments(filter),
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total/limit), data });
  } catch (err) { next(err); }
});

// Admin/Employee: update status
router.put('/:id', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const request = await ConnectionRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
});

export default router;
