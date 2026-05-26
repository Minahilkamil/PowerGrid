import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);

export default router;
