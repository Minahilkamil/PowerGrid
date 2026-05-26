import { Router } from 'express';
import {
  registerComplaint,
  getMyComplaints,
  getComplaints,
  updateComplaint,
} from '../controllers/complaint.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', authorize('consumer'), registerComplaint);
router.get('/me', authorize('consumer'), getMyComplaints);

router.get('/', authorize('admin', 'employee'), getComplaints);
router.put('/:id', authorize('admin', 'employee'), updateComplaint);

export default router;
