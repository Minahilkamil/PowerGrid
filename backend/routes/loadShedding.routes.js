import { Router } from 'express';
import LoadShedding from '../models/LoadShedding.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// All authenticated users can view schedules
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.area) filter.area = new RegExp(req.query.area, 'i');
    if (req.query.status) filter.status = req.query.status;
    const schedules = await LoadShedding.find(filter).sort({ date: 1, startTime: 1 }).limit(50);
    res.json({ success: true, data: schedules });
  } catch (err) { next(err); }
});

// Admin/Employee: create schedule
router.post('/', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const schedule = await LoadShedding.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) { next(err); }
});

// Admin/Employee: update
router.put('/:id', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    const schedule = await LoadShedding.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
});

// Admin/Employee: delete
router.delete('/:id', authorize('admin', 'employee'), async (req, res, next) => {
  try {
    await LoadShedding.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
