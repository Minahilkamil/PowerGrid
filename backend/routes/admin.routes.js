import { Router } from 'express';
import {
  getDashboardStats,
  getRecentTransactions,
  getAllUsers,
  updateUserStatus,
  getPendingEmployees,
  approveEmployee,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/recent-transactions', getRecentTransactions);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/pending-employees', getPendingEmployees);
router.put('/employees/:id/approve', approveEmployee);

export default router;
