import mongoose from 'mongoose';
import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Send a project invitation
// @route   POST /api/invitations
// @access  Private (project admin)
export const sendInvitation = async (req, res, next) => {
  try {
    const { projectId, email, role } = req.body;

    if (!projectId || !email) {
      res.status(400);
      throw new Error('Project ID and email are required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if sender is admin
    const senderMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!senderMember || senderMember.role !== 'admin') {
      res.status(403);
      throw new Error('Only project admins can send invitations');
    }

    // Find recipient by email
    const recipient = await User.findOne({ email: email.toLowerCase() });
    if (!recipient) {
      res.status(404);
      throw new Error('No user found with this email. They need to sign up first.');
    }

    // Can't invite yourself
    if (recipient._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot invite yourself');
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === recipient._id.toString()
    );
    if (alreadyMember) {
      res.status(400);
      throw new Error('This user is already a member of the project');
    }

    // Check if there's already a pending invitation
    const existingInvite = await Invitation.findOne({
      project: projectId,
      recipient: recipient._id,
      status: 'pending',
    });
    if (existingInvite) {
      res.status(400);
      throw new Error('An invitation is already pending for this user');
    }

    // Create invitation
    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user._id,
      recipient: recipient._id,
      role: role || 'member',
    });

    const populated = await Invitation.findById(invitation._id)
      .populate('project', 'name color')
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my pending invitations
// @route   GET /api/invitations/me
// @access  Private
export const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      recipient: req.user._id,
      status: 'pending',
    })
      .populate('project', 'name color description')
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent invitations for a project
// @route   GET /api/invitations/project/:projectId
// @access  Private (project member)
export const getProjectInvitations = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const invitations = await Invitation.find({
      project: req.params.projectId,
      status: 'pending',
    })
      .populate('recipient', 'name email avatar')
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an invitation
// @route   PUT /api/invitations/:id/accept
// @access  Private (recipient only)
export const acceptInvitation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid invitation ID');
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    // Only the recipient can accept
    if (invitation.recipient.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the invited user can accept this invitation');
    }

    if (invitation.status !== 'pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    // Add user to project members
    const project = await Project.findById(invitation.project);
    if (!project) {
      res.status(404);
      throw new Error('Project no longer exists');
    }

    // Double-check not already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!alreadyMember) {
      project.members.push({
        user: req.user._id,
        role: invitation.role || 'member',
      });
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    const populated = await Invitation.findById(invitation._id)
      .populate('project', 'name color')
      .populate('sender', 'name email avatar');

    res.json({ message: 'Invitation accepted', invitation: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline an invitation
// @route   PUT /api/invitations/:id/decline
// @access  Private (recipient only)
export const declineInvitation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid invitation ID');
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    // Only the recipient can decline
    if (invitation.recipient.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the invited user can decline this invitation');
    }

    if (invitation.status !== 'pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    invitation.status = 'declined';
    await invitation.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
};
