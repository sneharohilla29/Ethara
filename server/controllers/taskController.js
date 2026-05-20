import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';

// Helper: check if user is a member of the project
const checkMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, isMember: false, isAdmin: false };

  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  return {
    project,
    isMember: !!member,
    isAdmin: member?.role === 'admin',
  };
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/tasks/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get all projects the user is part of
    const projects = await Project.find({
      'members.user': req.user._id,
    });
    const projectIds = projects.map((p) => p._id);

    // Get all tasks in user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === 'done').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const overdue = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    // Recent tasks (last 5)
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      completed,
      inProgress,
      overdue,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getProjectTasks = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const { isMember } = await checkMembership(req.params.projectId, req.user._id);
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, project, status, priority, assignee, dueDate, order } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    if (!project) {
      res.status(400);
      throw new Error('Project ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      res.status(400);
      throw new Error('Invalid project ID');
    }

    const { isMember } = await checkMembership(project, req.user._id);
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to create tasks in this project');
    }

    const task = await Task.create({
      title,
      description: description || '',
      project,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      reporter: req.user._id,
      dueDate: dueDate || null,
      order: order || 0,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check membership in the task's project
    const { isMember } = await checkMembership(task.project, req.user._id);
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    const { title, description, status, priority, assignee, dueDate, order } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (for Kanban)
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { status } = req.body;
    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    task.status = status;
    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (admin only)
export const deleteTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check if user is admin in the project
    const { isAdmin } = await checkMembership(task.project, req.user._id);
    if (!isAdmin) {
      res.status(403);
      throw new Error('Only project admins can delete tasks');
    }

    // Delete all comments on this task
    await Comment.deleteMany({ task: task._id });

    // Delete the task
    await Task.findByIdAndDelete(task._id);

    res.json({ message: 'Task and related comments deleted' });
  } catch (error) {
    next(error);
  }
};
