const COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#D97706', '#059669', '#0891B2',
  '#2563EB', '#4338CA', '#9333EA', '#C026D3',
  '#E11D48', '#0D9488', '#0284C7', '#6D28D9',
];

function getColorFromName(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const color = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
