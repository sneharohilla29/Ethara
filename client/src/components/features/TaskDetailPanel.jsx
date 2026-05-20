import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoTrashOutline } from 'react-icons/io5';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { commentsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function TaskDetailPanel({ task, onClose, onUpdate }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task?._id) {
      fetchComments();
    }
  }, [task?._id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await commentsAPI.getTaskComments(task._id);
      setComments(res.data.comments || res.data || []);
    } catch {
      // Comments may not be available
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentsAPI.createComment(task._id, { text: newComment });
      const comment = res.data.comment || res.data;
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.deleteComment(task._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (!task) return null;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <AnimatePresence>
      <motion.div
        className="task-panel-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="task-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="task-panel-header">
          <h2>Task Details</h2>
          <button className="task-panel-close" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="task-panel-body">
          <h1 className="task-panel-title">{task.title}</h1>

          <div className="task-panel-meta">
            <span className="task-panel-meta-label">Status</span>
            <span className="task-panel-meta-value">
              <Badge variant={task.status || 'todo'} />
            </span>

            <span className="task-panel-meta-label">Priority</span>
            <span className="task-panel-meta-value">
              <Badge variant={task.priority || 'medium'} />
            </span>

            <span className="task-panel-meta-label">Assignee</span>
            <span className="task-panel-meta-value">
              {task.assignee ? (
                <>
                  <Avatar name={task.assignee.name || task.assignee} size="sm" />
                  {task.assignee.name || task.assignee}
                </>
              ) : (
                <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>
              )}
            </span>

            <span className="task-panel-meta-label">Due Date</span>
            <span className="task-panel-meta-value">
              {dueDate ? format(dueDate, 'MMM d, yyyy') : '—'}
            </span>
          </div>

          {task.description && (
            <div className="task-panel-description">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="task-panel-comments">
            <h3>Comments ({comments.length})</h3>

            {comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <Avatar
                  name={comment.user?.name || comment.author?.name || 'User'}
                  size="sm"
                />
                <div className="comment-content">
                  <span className="comment-author">
                    {comment.user?.name || comment.author?.name || 'User'}
                    <span className="comment-time">
                      {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                        : ''}
                    </span>
                  </span>
                  <p className="comment-text">{comment.text || comment.content}</p>
                </div>
                {(comment.user?._id === user?._id || comment.author?._id === user?._id) && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDeleteComment(comment._id)}
                    title="Delete comment"
                  >
                    <IoTrashOutline />
                  </button>
                )}
              </div>
            ))}

            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                className="form-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={!newComment.trim()}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
