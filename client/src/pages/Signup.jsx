import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { HiOutlineBolt } from 'react-icons/hi2';
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
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

          <h1>Create your account</h1>
          <p className="auth-subtitle">Get started with TaskFlow for free</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              icon={IoPersonOutline}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <Button type="submit" variant="primary" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>

      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="auth-brand-stats">
            <motion.div
              className="auth-stat-pill"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <span className="auth-stat-number">2.4k+</span>
              <span className="auth-stat-label">Teams</span>
            </motion.div>
            <motion.div
              className="auth-stat-pill"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <span className="auth-stat-number">98%</span>
              <span className="auth-stat-label">Uptime</span>
            </motion.div>
            <motion.div
              className="auth-stat-pill"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span className="auth-stat-number">4.9★</span>
              <span className="auth-stat-label">Rating</span>
            </motion.div>
          </div>
          <h2>Start shipping faster</h2>
          <p>
            Join thousands of teams using TaskFlow to plan, track, 
            and deliver their best work together.
          </p>
        </div>
        <div className="auth-brand-orb orb-1" />
        <div className="auth-brand-orb orb-2" />
      </div>
    </div>
  );
}
