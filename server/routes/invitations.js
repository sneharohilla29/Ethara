import express from 'express';
import protect from '../middleware/auth.js';
import {
  sendInvitation,
  getMyInvitations,
  getProjectInvitations,
  acceptInvitation,
  declineInvitation,
} from '../controllers/invitationController.js';

const router = express.Router();

router.post('/', protect, sendInvitation);
router.get('/me', protect, getMyInvitations);
router.get('/project/:projectId', protect, getProjectInvitations);
router.put('/:id/accept', protect, acceptInvitation);
router.put('/:id/decline', protect, declineInvitation);

export default router;
