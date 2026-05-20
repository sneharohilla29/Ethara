import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
export const getTaskComments = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { content, task } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    if (!task) {
      res.status(400);
      throw new Error('Task ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(task)) {
      res.status(400);
      throw new Error('Invalid task ID');
    }

    // Verify task exists
    const taskDoc = await Task.findById(task);
    if (!taskDoc) {
      res.status(404);
      throw new Error('Task not found');
    }

    const comment = await Comment.create({
      content,
      task,
      author: req.user._id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar'
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author or project admin)
export const deleteComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid comment ID');
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    // Check if user is the author
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (!isAuthor) {
      // Check if user is admin in the project that owns the task
      const task = await Task.findById(comment.task);
      if (!task) {
        res.status(404);
        throw new Error('Associated task not found');
      }

      const project = await Project.findById(task.project);
      if (!project) {
        res.status(404);
        throw new Error('Associated project not found');
      }

      const isProjectAdmin = project.members.some(
        (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
      );

      if (!isProjectAdmin) {
        res.status(403);
        throw new Error('Only the comment author or a project admin can delete this comment');
      }
    }

    await Comment.findByIdAndDelete(comment._id);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
