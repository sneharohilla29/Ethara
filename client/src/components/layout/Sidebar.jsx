import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import InvitationBell from '../features/InvitationBell';
import {
  IoGridOutline,
  IoFolderOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoClose,
} from 'react-icons/io5';
import { HiOutlineBolt } from 'react-icons/hi2';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: IoGridOutline },
  { path: '/projects', label: 'Projects', icon: IoFolderOutline },
  { path: '/team', label: 'Team', icon: IoPeopleOutline },
  { path: '/settings', label: 'Settings', icon: IoSettingsOutline },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <HiOutlineBolt />
            </div>
            <span className="sidebar-logo-text">TaskFlow</span>
          </div>
          <div className="sidebar-header-actions">
            <InvitationBell />
            <button className="sidebar-close-mobile" onClick={onClose}>
              <IoClose />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <item.icon className="sidebar-link-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Logout">
            <Avatar name={user?.name || ''} size="sm" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{user?.name || 'User'}</div>
              <div className="sidebar-user-email truncate">{user?.email || ''}</div>
            </div>
            <IoLogOutOutline style={{ fontSize: 18, color: 'var(--text-tertiary)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}
