import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import KanbanBoard from '../components/features/KanbanBoard';
import TaskDetailPanel from '../components/features/TaskDetailPanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);

  // Add Task Modal
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    status: 'todo',
  });
  const [creatingTask, setCreatingTask] = useState(false);

  // Invite Member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectsAPI.getProject(id),
        tasksAPI.getProjectTasks(id),
      ]);
      setProject(projRes.data.project || projRes.data);
      setTasks(tasksRes.data.tasks || tasksRes.data || []);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await tasksAPI.updateTaskStatus(taskId, newStatus);
    } catch {
      toast.error('Failed to update task');
      fetchData();
    }
  }, []);

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setCreatingTask(true);
    try {
      const payload = { ...taskForm };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await tasksAPI.createTask(id, payload);
      const newTask = res.data.task || res.data;
      setTasks((prev) => [...prev, newTask]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '', status: 'todo' });
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await projectsAPI.addMember(id, { email: inviteEmail });
      toast.success('Invitation sent! They will see it in their notifications.');
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await projectsAPI.removeMember(id, memberId);
      toast.success('Member removed');
      fetchData();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const members = project?.members || [];
  const isAdmin = members.some(
    (m) => (m.user?._id === user?._id || m.user === user?._id) && m.role === 'admin'
  ) || project?.owner === user?._id || project?.owner?._id === user?._id;

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.user?._id || m._id,
      label: m.user?.name || m.name || m.email || 'Member',
    })),
  ];

  if (loading) {
    return (
      <div>
        <Skeleton height="28px" width="200px" style={{ marginBottom: 12 }} />
        <Skeleton height="16px" width="400px" style={{ marginBottom: 24 }} />
        <Skeleton height="400px" />
      </div>
    );
  }

  if (!project) {
    return <EmptyState title="Project not found" description="This project may have been deleted." />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="project-detail-header">
        <div className="project-detail-top">
          <div>
            <h1>{project.name}</h1>
            {project.description && (
              <p className="project-detail-desc">{project.description}</p>
            )}
          </div>
          <Button variant="primary" size="md" onClick={() => setTaskModal(true)}>
            <IoAddOutline /> Add Task
          </Button>
        </div>
        <div className="project-detail-meta">
          <div className="avatar-stack">
            {members.slice(0, 4).map((m, i) => (
              <Avatar key={m._id || i} name={m.user?.name || m.name || ''} size="sm" />
            ))}
            {members.length > 4 && (
              <span className="avatar-stack-count">+{members.length - 4}</span>
            )}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {members.length} member{members.length !== 1 ? 's' : ''} · {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        {['board', 'list', 'members'].map((tab) => (
          <button
            key={tab}
            className={`project-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'board' ? 'Board' : tab === 'list' ? 'List' : 'Members'}
          </button>
        ))}
      </div>

      {/* Board Tab */}
      {activeTab === 'board' && (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onTaskClick={setSelectedTask}
        />
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="task-table">
          {tasks.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No tasks yet. Add one to get started.
            </div>
          ) : (
            <>
              <div className="task-table-header">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Assignee</span>
                <span>Due Date</span>
              </div>
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="task-table-row"
                  onClick={() => setSelectedTask(task)}
                >
                  <span className="task-table-title">{task.title}</span>
                  <span><Badge variant={task.status} /></span>
                  <span><Badge variant={task.priority} /></span>
                  <span className="task-table-project">
                    {task.assignee?.name || 'Unassigned'}
                  </span>
                  <span className="task-table-date">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {isAdmin && (
            <form className="invite-form" onSubmit={handleInviteMember}>
              <input
                className="form-input"
                placeholder="Enter email to invite..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" size="md" loading={inviting}>
                Invite
              </Button>
            </form>
          )}

          <div className="members-list">
            {members.map((member) => (
              <div key={member._id || member.user?._id} className="member-row">
                <Avatar name={member.user?.name || member.name || ''} size="md" />
                <div className="member-info">
                  <div className="member-name">{member.user?.name || member.name || 'User'}</div>
                  <div className="member-email">{member.user?.email || member.email || ''}</div>
                </div>
                <span className="member-role">{member.role || 'member'}</span>
                {isAdmin && member.role !== 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.user?._id || member._id)}
                  >
                    <IoTrashOutline />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={taskModal}
        onClose={() => setTaskModal(false)}
        title="Add Task"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleCreateTask} loading={creatingTask}>Create</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Title"
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <Input
            label="Description"
            type="textarea"
            placeholder="Describe the task..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <Select
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          />
          <Select
            label="Status"
            options={[
              { value: 'backlog', label: 'Backlog' },
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'in_review', label: 'In Review' },
              { value: 'done', label: 'Done' },
            ]}
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          />
          <Select
            label="Assignee"
            options={memberOptions}
            value={taskForm.assignee}
            onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
          />
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
        </div>
      </Modal>
    </motion.div>
  );
}
