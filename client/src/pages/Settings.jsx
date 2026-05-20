import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../contexts/ThemeContext';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggle } = useContext(ThemeContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name, email });
      updateUser(res.data.user || res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <h2>Profile</h2>
        <form className="settings-form" onSubmit={handleSave}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
          <div>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-row">
          <div>
            <label>Dark Mode</label>
            <p>Toggle between light and dark themes</p>
          </div>
          <button
            className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggle}
            type="button"
          >
            <span className="theme-toggle-knob" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
