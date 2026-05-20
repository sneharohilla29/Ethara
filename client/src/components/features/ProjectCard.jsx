import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { IoDocumentTextOutline, IoPeopleOutline } from 'react-icons/io5';

const PROJECT_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#059669',
  '#D97706', '#DC2626', '#2563EB', '#0891B2',
];

export default function ProjectCard({ project, index = 0 }) {
  const navigate = useNavigate();
  const borderColor = project.color || PROJECT_COLORS[index % PROJECT_COLORS.length];
  const members = project.members || [];
  const taskCount = project.taskCount ?? project.tasks?.length ?? 0;

  return (
    <motion.div
      className="project-card"
      style={{ borderLeftColor: borderColor }}
      onClick={() => navigate(`/projects/${project._id}`)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <h3 className="project-card-name">{project.name}</h3>
      <p className="project-card-desc">
        {project.description || 'No description'}
      </p>
      <div className="project-card-footer">
        <div className="avatar-stack">
          {members.slice(0, 3).map((m, i) => (
            <Avatar
              key={m._id || i}
              name={m.user?.name || m.name || ''}
              size="sm"
            />
          ))}
          {members.length > 3 && (
            <span className="avatar-stack-count">+{members.length - 3}</span>
          )}
        </div>
        <div className="project-card-meta">
          <span className="project-card-meta-item">
            <IoPeopleOutline /> {members.length}
          </span>
          <span className="project-card-meta-item">
            <IoDocumentTextOutline /> {taskCount}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
