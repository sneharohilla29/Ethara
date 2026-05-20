export function Skeleton({ width, height, borderRadius, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '14px',
        borderRadius: borderRadius || undefined,
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

export function SkeletonAvatar({ size = 34 }) {
  return (
    <div
      className="skeleton"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

export function SkeletonStat() {
  return <div className="skeleton skeleton-stat" />;
}
