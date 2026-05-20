import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { HiOutlineBolt } from 'react-icons/hi2';
import {
  IoFolderOutline,
  IoCheckboxOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const features = [
  {
    icon: IoFolderOutline,
    colorClass: 'icon-indigo',
    title: 'Organize Projects',
    desc: 'Create projects, invite team members, and keep everything organized in one place. Assign colors and track progress effortlessly.',
  },
  {
    icon: IoCheckboxOutline,
    colorClass: 'icon-green',
    title: 'Track Tasks',
    desc: 'Manage tasks with a Kanban board. Drag and drop between columns, set priorities, assign team members, and never miss a deadline.',
  },
  {
    icon: IoPeopleOutline,
    colorClass: 'icon-orange',
    title: 'Collaborate',
    desc: 'Comment on tasks, mention teammates, and stay in sync. Real-time updates keep everyone on the same page.',
  },
];

export default function Landing() {
  return (
    <div>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-nav-logo">
            <div className="landing-nav-logo-icon">
              <HiOutlineBolt />
            </div>
            TaskFlow
          </Link>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#cta">About</a>
          </div>

          <div className="landing-nav-actions">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        className="landing-hero"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div className="landing-hero-badge" variants={fadeUp} custom={0}>
          ✨ Built for modern teams
        </motion.div>
        <motion.h1 variants={fadeUp} custom={1}>
          Manage your team's work, <span className="landing-hero-accent">effortlessly</span>
        </motion.h1>
        <motion.p variants={fadeUp} custom={2}>
          TaskFlow helps your team stay organized with intuitive project management, 
          real-time collaboration, and a beautiful Kanban board.
        </motion.p>
        <motion.div className="landing-hero-actions" variants={fadeUp} custom={3}>
          <Link to="/signup">
            <Button variant="primary" size="lg">Start for free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Sign in</Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="landing-features" id="features">
        <motion.div
          className="landing-features-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Everything you need</h2>
          <p>Simple, powerful tools to keep your projects on track.</p>
        </motion.div>

        <div className="landing-features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="landing-feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={`landing-feature-icon ${feature.colorClass}`}>
                <feature.icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" id="cta">
        <motion.div
          className="landing-cta-box"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to get started?</h2>
          <p>Join teams that ship faster with TaskFlow.</p>
          <Link to="/signup">
            <Button className="btn-white" size="lg">
              Create your workspace
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 TaskFlow. Built with care.</p>
      </footer>
    </div>
  );
}
