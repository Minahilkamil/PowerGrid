import { Router } from 'express';
import { body } from 'express-validator';
import {
  addConsumer,
  getConsumers,
  getConsumer,
  updateConsumer,
  deleteConsumer,
  getConsumerProfile,
  updateConsumerProfile,
  updateConsumerAvatar,
} from '../controllers/consumer.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(protect);

// Consumer's own profile
router.get('/profile/me', authorize('consumer'), getConsumerProfile);
router.put('/profile/me', authorize('consumer'), updateConsumerProfile);
router.put('/profile/me/avatar', authorize('consumer'), upload.single('profileImage'), updateConsumerAvatar);

// Admin / Employee routes
router.post(
  '/',
  authorize('admin', 'employee'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('cnic')
      .matches(/^\d{5}-\d{7}-\d{1}$/)
      .withMessage('CNIC must be in format XXXXX-XXXXXXX-X'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('area').notEmpty().withMessage('Area is required'),
    body('meterNumber').notEmpty().withMessage('Meter number is required'),
  ],
  validate,
  addConsumer
);

router.get('/', authorize('admin', 'employee'), getConsumers);
router.get('/:id', authorize('admin', 'employee'), getConsumer);
router.put('/:id', authorize('admin', 'employee'), updateConsumer);
router.delete('/:id', authorize('admin'), deleteConsumer);

export default router;
