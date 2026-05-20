import express from 'express';
import protect from '../middleware/auth.js';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, createProject);

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

export default router;
