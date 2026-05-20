import express from 'express';
import protect from '../middleware/auth.js';
import {
  getMyTasks,
  getDashboardStats,
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Specific routes MUST come before parameterized routes
router.get('/my-tasks', protect, getMyTasks);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/project/:projectId', protect, getProjectTasks);

router.route('/').post(protect, createTask);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.put('/:id/status', protect, updateTaskStatus);

export default router;
