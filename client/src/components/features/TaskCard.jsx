import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { IoCalendarOutline } from 'react-icons/io5';
import { format, isPast, isToday } from 'date-fns';

export default function TaskCard({ task, onClick, provided, snapshot }) {
  const isDragging = snapshot?.isDragging;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done';

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={onClick}
      style={{
        ...provided?.draggableProps?.style,
      }}
    >
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-footer">
        <div className="task-card-left">
          <Badge variant={task.priority || 'medium'} />
          {dueDate && (
            <span className={`task-card-date ${isOverdue ? 'badge-red' : ''}`} style={isOverdue ? { color: 'var(--danger)' } : {}}>
              <IoCalendarOutline />
              {format(dueDate, 'MMM d')}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar
            name={task.assignee.name || task.assignee}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
