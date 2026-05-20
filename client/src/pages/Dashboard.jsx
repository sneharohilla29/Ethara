import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/features/StatsCard';
import Badge from '../components/ui/Badge';
import { SkeletonStat, Skeleton } from '../components/ui/Skeleton';
import { tasksAPI } from '../services/api';
import { format, formatDistanceToNow, isPast, isToday, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import {
  IoCheckmarkDoneOutline,
  IoListOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        tasksAPI.getDashboardStats().catch(() => ({ data: {} })),
        tasksAPI.getMyTasks().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data.stats || statsRes.data || { total: 0, completed: 0, inProgress: 0, overdue: 0 });
      setTasks(tasksRes.data.tasks || tasksRes.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getDeadlineDotClass = (dateStr) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return 'deadline-dot-red';
    if (date <= addDays(new Date(), 2)) return 'deadline-dot-yellow';
    return 'deadline-dot-green';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dashboard-greeting">
        <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Tasks"
              value={stats?.total ?? 0}
              icon={IoListOutline}
              colorClass="stat-icon-blue"
            />
            <StatsCard
              title="Completed"
              value={stats?.completed ?? 0}
              icon={IoCheckmarkDoneOutline}
              colorClass="stat-icon-green"
            />
            <StatsCard
              title="In Progress"
              value={stats?.inProgress ?? 0}
              icon={IoTimeOutline}
              colorClass="stat-icon-yellow"
            />
            <StatsCard
              title="Overdue"
              value={stats?.overdue ?? 0}
              icon={IoAlertCircleOutline}
              colorClass="stat-icon-red"
            />
          </>
        )}
      </div>

      {/* My Tasks */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Tasks</h2>
        </div>

        {loading ? (
          <div className="task-table">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <Skeleton height="16px" width={i % 2 === 0 ? '70%' : '50%'} />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="task-table" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No tasks assigned to you yet.
          </div>
        ) : (
          <div className="task-table">
            <div className="task-table-header">
              <span>Task</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Due Date</span>
              <span>Project</span>
            </div>
            {tasks.slice(0, 10).map((task, i) => (
              <motion.div
                key={task._id}
                className="task-table-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="task-table-title">{task.title}</span>
                <span><Badge variant={task.status || 'todo'} /></span>
                <span><Badge variant={task.priority || 'medium'} /></span>
                <span className="task-table-date">
                  {task.dueDate
                    ? format(new Date(task.dueDate), 'MMM d')
                    : '—'}
                </span>
                <span className="task-table-project">
                  {task.project?.name || '—'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Upcoming Deadlines</h2>
          </div>
          <div className="task-table">
            {upcomingDeadlines.map((task) => (
              <div key={task._id} className="deadline-item">
                <span className={`deadline-dot ${getDeadlineDotClass(task.dueDate)}`} />
                <div className="deadline-info">
                  <div className="deadline-title">{task.title}</div>
                  <div className="deadline-date">
                    {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant={task.priority || 'medium'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
