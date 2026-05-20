const VARIANT_MAP = {
  // Status variants
  backlog: 'badge-gray',
  todo: 'badge-blue',
  in_progress: 'badge-yellow',
  in_review: 'badge-purple',
  done: 'badge-green',
  // Priority variants
  low: 'badge-gray',
  medium: 'badge-blue',
  high: 'badge-orange',
  urgent: 'badge-red',
  // Generic
  gray: 'badge-gray',
  blue: 'badge-blue',
  yellow: 'badge-yellow',
  green: 'badge-green',
  red: 'badge-red',
  orange: 'badge-orange',
  purple: 'badge-purple',
  indigo: 'badge-indigo',
};

const LABEL_MAP = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function Badge({ variant = 'gray', children, className = '' }) {
  const badgeClass = VARIANT_MAP[variant] || 'badge-gray';
  const label = children || LABEL_MAP[variant] || variant;

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {label}
    </span>
  );
}
