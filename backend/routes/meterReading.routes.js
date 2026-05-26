import { Router } from 'express';
import { body } from 'express-validator';
import {
  addReading,
  getReadings,
  getConsumerReadings,
  updateReading,
  getReadingHistory,
} from '../controllers/meterReading.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'employee'),
  [
    body('consumerId').notEmpty().withMessage('Consumer ID is required'),
    body('previousReading').isNumeric().withMessage('Previous reading must be a number'),
    body('currentReading').isNumeric().withMessage('Current reading must be a number'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
  ],
  validate,
  addReading
);

router.get('/', authorize('admin', 'employee'), getReadings);
router.get('/consumer/:consumerId', getConsumerReadings);
router.get('/history/:consumerId', getReadingHistory);
router.put('/:id', authorize('admin', 'employee'), updateReading);

export default router;
