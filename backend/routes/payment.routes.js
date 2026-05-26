import { Router } from 'express';
import { body } from 'express-validator';
import {
  processPayment,
  getPayments,
  getConsumerPayments,
  getPaymentReceipt,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [
    body('billId').notEmpty().withMessage('Bill ID is required'),
    body('paymentMethod')
      .isIn(['credit_card', 'bank_transfer', 'easypaisa', 'jazzcash'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  processPayment
);

router.get('/', authorize('admin', 'employee'), getPayments);
router.get('/consumer/:consumerId', getConsumerPayments);
router.get('/:id/receipt', getPaymentReceipt);

export default router;
