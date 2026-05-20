import express from 'express';
import protect from '../middleware/auth.js';
import {
  getTaskComments,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/task/:taskId', protect, getTaskComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

export default router;
