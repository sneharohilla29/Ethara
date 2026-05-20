import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { HiOutlineBolt } from 'react-icons/hi2';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-form-side"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-form-container">
          <Link to="/" className="auth-form-logo">
            <div className="sidebar-logo-icon">
              <HiOutlineBolt />
            </div>
            <span>TaskFlow</span>
          </Link>

          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              icon={IoMailOutline}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              icon={IoLockClosedOutline}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Button type="submit" variant="primary" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </motion.div>

      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="auth-brand-grid">
            <motion.div
              className="auth-brand-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="auth-card-dot dot-green" />
              <span className="auth-card-text">Design System</span>
              <span className="auth-card-badge badge-done">Done</span>
            </motion.div>
            <motion.div
              className="auth-brand-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <div className="auth-card-dot dot-yellow" />
              <span className="auth-card-text">Sprint Planning</span>
              <span className="auth-card-badge badge-progress">In Progress</span>
            </motion.div>
            <motion.div
              className="auth-brand-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="auth-card-dot dot-blue" />
              <span className="auth-card-text">API Integration</span>
              <span className="auth-card-badge badge-todo">To Do</span>
            </motion.div>
          </div>
          <h2>Manage work with clarity</h2>
          <p>
            Keep your team aligned and projects moving forward with TaskFlow's 
            intuitive task management tools.
          </p>
        </div>
        <div className="auth-brand-orb orb-1" />
        <div className="auth-brand-orb orb-2" />
      </div>
    </div>
  );
}
