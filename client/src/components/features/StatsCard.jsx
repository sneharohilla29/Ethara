import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, colorClass = 'stat-icon-blue' }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stat-card-info">
        <h3>{title}</h3>
        <div className="stat-card-value">{value}</div>
      </div>
      <div className={`stat-card-icon ${colorClass}`}>
        {Icon && <Icon />}
      </div>
    </motion.div>
  );
}
