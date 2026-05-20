import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('taskflow_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Auth API
// ==========================================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ==========================================
// Projects API
// ==========================================
export const projectsAPI = {
  getProjects: () => api.get('/projects'),
  createProject: (data) => api.post('/projects', data),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`),
};

// ==========================================
// Tasks API
// Routes: GET /tasks/my-tasks, GET /tasks/dashboard-stats,
//         GET /tasks/project/:projectId, POST /tasks,
//         GET/PUT/DELETE /tasks/:id, PUT /tasks/:id/status
// ==========================================
export const tasksAPI = {
  getProjectTasks: (projectId) => api.get(`/tasks/project/${projectId}`),
  createTask: (projectId, data) => api.post('/tasks', { ...data, project: projectId }),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  updateTaskStatus: (taskId, status) => api.put(`/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getDashboardStats: () => api.get('/tasks/dashboard-stats'),
};

// ==========================================
// Comments API
// Routes: GET /comments/task/:taskId, POST /comments, DELETE /comments/:id
// Backend uses 'content' field (not 'text'), 'author' (not 'user')
// ==========================================
export const commentsAPI = {
  getTaskComments: (taskId) => api.get(`/comments/task/${taskId}`),
  createComment: (taskId, data) => api.post('/comments', { content: data.text || data.content, task: taskId }),
  deleteComment: (taskId, commentId) => api.delete(`/comments/${commentId}`),
};

// ==========================================
// Invitations API
// ==========================================
export const invitationsAPI = {
  getMyInvitations: () => api.get('/invitations/me'),
  getProjectInvitations: (projectId) => api.get(`/invitations/project/${projectId}`),
  sendInvitation: (data) => api.post('/invitations', data),
  acceptInvitation: (id) => api.put(`/invitations/${id}/accept`),
  declineInvitation: (id) => api.put(`/invitations/${id}/decline`),
};

export default api;
