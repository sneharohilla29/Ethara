import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotificationsOutline, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { invitationsAPI } from '../../services/api';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function InvitationBell() {
  const [invitations, setInvitations] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchInvitations();
    // Poll every 30 seconds for new invitations
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await invitationsAPI.getMyInvitations();
      setInvitations(res.data || []);
    } catch {
      // Silently fail
    }
  };

  const handleAccept = async (id) => {
    setLoading((prev) => ({ ...prev, [id]: 'accepting' }));
    try {
      await invitationsAPI.acceptInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
      toast.success('Invitation accepted! You can now access the project.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDecline = async (id) => {
    setLoading((prev) => ({ ...prev, [id]: 'declining' }));
    try {
      await invitationsAPI.declineInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
      toast('Invitation declined', { icon: '✕' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const count = invitations.length;

  return (
    <div className="invitation-bell-wrap" ref={dropdownRef}>
      <button
        className="invitation-bell-btn"
        onClick={() => setOpen(!open)}
        title="Invitations"
      >
        <IoNotificationsOutline />
        {count > 0 && (
          <motion.span
            className="invitation-bell-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
          >
            {count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="invitation-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="invitation-dropdown-header">
              <span>Invitations</span>
              {count > 0 && <span className="invitation-dropdown-count">{count}</span>}
            </div>

            <div className="invitation-dropdown-body">
              {count === 0 ? (
                <div className="invitation-dropdown-empty">
                  No pending invitations
                </div>
              ) : (
                invitations.map((inv) => (
                  <motion.div
                    key={inv._id}
                    className="invitation-item"
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="invitation-item-top">
                      <div
                        className="invitation-project-dot"
                        style={{ background: inv.project?.color || '#4F46E5' }}
                      />
                      <div className="invitation-item-info">
                        <span className="invitation-project-name">
                          {inv.project?.name || 'Project'}
                        </span>
                        <span className="invitation-meta">
                          from {inv.sender?.name || 'Someone'} · {' '}
                          {inv.createdAt
                            ? formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                      </div>
                    </div>
                    <div className="invitation-item-actions">
                      <button
                        className="invitation-accept-btn"
                        onClick={() => handleAccept(inv._id)}
                        disabled={!!loading[inv._id]}
                        title="Accept"
                      >
                        {loading[inv._id] === 'accepting' ? (
                          <span className="btn-spinner" />
                        ) : (
                          <IoCheckmarkOutline />
                        )}
                        Accept
                      </button>
                      <button
                        className="invitation-decline-btn"
                        onClick={() => handleDecline(inv._id)}
                        disabled={!!loading[inv._id]}
                        title="Decline"
                      >
                        {loading[inv._id] === 'declining' ? (
                          <span className="btn-spinner" />
                        ) : (
                          <IoCloseOutline />
                        )}
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
