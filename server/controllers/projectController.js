import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// Helper: check if user is a member of the project
const isMember = (project, userId) => {
  return project.members.some(
    (m) => m.user.toString() === userId.toString() || m.user._id?.toString() === userId.toString()
  );
};

// Helper: check if user is admin of the project
const isAdmin = (project, userId) => {
  return project.members.some(
    (m) =>
      (m.user.toString() === userId.toString() || m.user._id?.toString() === userId.toString()) &&
      m.role === 'admin'
  );
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Project name is required');
    }

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#4F46E5',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check membership
    if (!isMember(project, req.user._id)) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (admin only)
export const updateProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is admin
    if (!isAdmin(project, req.user._id)) {
      res.status(403);
      throw new Error('Only project admins can update the project');
    }

    const { name, description, status, color } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (color !== undefined) project.color = color;

    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
export const deleteProject = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the project owner can delete this project');
    }

    // Delete all tasks in this project
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map((t) => t._id);

    // Delete all comments on those tasks
    await Comment.deleteMany({ task: { $in: taskIds } });

    // Delete all tasks
    await Task.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and all related data deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send invite to add a member (creates an invitation)
// @route   POST /api/projects/:id/members
// @access  Private (admin only)
export const addMember = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is admin
    if (!isAdmin(project, req.user._id)) {
      res.status(403);
      throw new Error('Only project admins can invite members');
    }

    const { email, role } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      res.status(404);
      throw new Error('No user found with this email. They need to sign up first.');
    }

    // Can't invite yourself
    if (userToAdd._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot invite yourself');
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      res.status(400);
      throw new Error('User is already a member of this project');
    }

    // Check if there's already a pending invitation
    const Invitation = (await import('../models/Invitation.js')).default;
    const existingInvite = await Invitation.findOne({
      project: project._id,
      recipient: userToAdd._id,
      status: 'pending',
    });
    if (existingInvite) {
      res.status(400);
      throw new Error('An invitation is already pending for this user');
    }

    // Create invitation instead of directly adding
    const invitation = await Invitation.create({
      project: project._id,
      sender: req.user._id,
      recipient: userToAdd._id,
      role: role || 'member',
    });

    const populatedInvite = await Invitation.findById(invitation._id)
      .populate('project', 'name color')
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: populatedInvite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (admin only)
export const removeMember = async (req, res, next) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) ||
      !mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      res.status(400);
      throw new Error('Invalid ID');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is admin
    if (!isAdmin(project, req.user._id)) {
      res.status(403);
      throw new Error('Only project admins can remove members');
    }

    // Can't remove the owner
    if (project.owner.toString() === req.params.userId) {
      res.status(400);
      throw new Error('Cannot remove the project owner');
    }

    // Check if the user to remove is a member
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === req.params.userId
    );
    if (memberIndex === -1) {
      res.status(404);
      throw new Error('User is not a member of this project');
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};
