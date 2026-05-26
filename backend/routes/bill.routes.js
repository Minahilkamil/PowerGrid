import { Router } from 'express';
import { body } from 'express-validator';
import {
  generateBill,
  getBills,
  getBill,
  getConsumerBills,
  markOverdue,
  downloadBill,
} from '../controllers/bill.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/generate',
  authorize('admin', 'employee'),
  [body('readingId').notEmpty().withMessage('Reading ID is required')],
  validate,
  generateBill
);

router.put('/mark-overdue', authorize('admin', 'employee'), markOverdue);

router.get('/', authorize('admin', 'employee'), getBills);
router.get('/consumer/:consumerId', getConsumerBills);
router.get('/:id', getBill);
router.get('/:id/download', downloadBill);

export default router;
