import { Router } from 'express';
import {
  getMyAnalytics,
  seedAnalytics,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/me', authorize('consumer'), getMyAnalytics);
router.post('/seed', authorize('admin'), seedAnalytics);

export default router;
