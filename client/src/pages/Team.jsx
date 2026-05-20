import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectsAPI } from '../services/api';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { IoPeopleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await projectsAPI.getProjects();
      const projects = res.data.projects || res.data || [];

      // Deduplicate members across projects
      const memberMap = new Map();
      projects.forEach((project) => {
        (project.members || []).forEach((m) => {
          const userId = m.user?._id || m._id;
          if (!memberMap.has(userId)) {
            memberMap.set(userId, {
              _id: userId,
              name: m.user?.name || m.name || 'User',
              email: m.user?.email || m.email || '',
              projects: [project.name],
            });
          } else {
            const existing = memberMap.get(userId);
            if (!existing.projects.includes(project.name)) {
              existing.projects.push(project.name);
            }
          }
        });
      });

      setMembers(Array.from(memberMap.values()));
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1>Team</h1>
      </div>

      {loading ? (
        <div className="team-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <Skeleton width="34px" height="34px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton height="14px" width="120px" style={{ marginBottom: 6 }} />
                <Skeleton height="12px" width="180px" />
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={IoPeopleOutline}
          title="No team members"
          description="Team members will appear here once you add people to your projects."
        />
      ) : (
        <div className="team-list">
          {members.map((member, i) => (
            <motion.div
              key={member._id}
              className="team-member-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Avatar name={member.name} size="md" />
              <div className="team-member-info">
                <div className="team-member-name">{member.name}</div>
                <div className="team-member-email">{member.email}</div>
              </div>
              <div className="team-member-projects">
                {member.projects.map((p) => (
                  <Badge key={p} variant="indigo">{p}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
