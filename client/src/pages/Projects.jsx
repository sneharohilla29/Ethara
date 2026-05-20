import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import ProjectCard from '../components/features/ProjectCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { IoAddOutline, IoSearchOutline, IoFolderOpenOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#059669',
  '#D97706', '#DC2626', '#2563EB', '#0891B2',
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getProjects();
      setProjects(res.data.projects || res.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setCreating(true);
    try {
      const res = await projectsAPI.createProject(form);
      const newProject = res.data.project || res.data;
      setProjects((prev) => [newProject, ...prev]);
      setModalOpen(false);
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Projects</h1>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <IoAddOutline /> New Project
        </Button>
      </div>

      <div className="search-input-wrap">
        <IoSearchOutline className="search-icon" />
        <input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="projects-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IoFolderOpenOutline}
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try a different search term.' : 'Create your first project to get started.'}
          actionLabel={!search ? 'Create Project' : undefined}
          onAction={!search ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="projects-grid">
          {filtered.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Project"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate} loading={creating}>
              Create
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Description"
            type="textarea"
            placeholder="What's this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${form.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm({ ...form, color })}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
