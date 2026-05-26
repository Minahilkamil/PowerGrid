import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRecentTransactions: () => api.get('/admin/recent-transactions'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getPendingEmployees: () => api.get('/admin/pending-employees'),
  approveEmployee: (id, action) => api.put(`/admin/employees/${id}/approve`, { action }),
};

// ── Consumers ─────────────────────────────────────────────────────────────────
export const consumerAPI = {
  getAll: (params) => api.get('/consumers', { params }),
  getOne: (id) => api.get(`/consumers/${id}`),
  add: (data) => api.post('/consumers', data),
  update: (id, data) => api.put(`/consumers/${id}`, data),
  delete: (id) => api.delete(`/consumers/${id}`),
  getProfile: () => api.get('/consumers/profile/me'),
  updateProfile: (data) => api.put('/consumers/profile/me', data),
  updateAvatar: (formData) => api.put('/consumers/profile/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ── Complaints ────────────────────────────────────────────────────────────────
export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getMy: () => api.get('/complaints/me'),
  register: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getMy: () => api.get('/analytics/me'),
};

// ── Meter Readings ────────────────────────────────────────────────────────────
export const meterAPI = {
  getAll: (params) => api.get('/meter-readings', { params }),
  getByConsumer: (id, params) => api.get(`/meter-readings/consumer/${id}`, { params }),
  getHistory: (id) => api.get(`/meter-readings/history/${id}`),
  add: (data) => api.post('/meter-readings', data),
  update: (id, data) => api.put(`/meter-readings/${id}`, data),
};

// ── Bills ─────────────────────────────────────────────────────────────────────
export const billAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getOne: (id) => api.get(`/bills/${id}`),
  getByConsumer: (id, params) => api.get(`/bills/consumer/${id}`, { params }),
  generate: (data) => api.post('/bills/generate', data),
  markOverdue: () => api.put('/bills/mark-overdue'),
  download: (id) => api.get(`/bills/${id}/download`, { responseType: 'blob' }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getByConsumer: (id, params) => api.get(`/payments/consumer/${id}`, { params }),
  process: (data) => api.post('/payments', data),
  getReceipt: (id) => api.get(`/payments/${id}/receipt`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── Outages & Load Shedding ───────────────────────────────────────────────────
export const outageAPI = {
  getSchedule: (area) => api.get('/load-shedding/schedule', { params: { area } }),
  getLive: () => api.get('/load-shedding/live'),
};

// ── Connection Services ───────────────────────────────────────────────────────
export const serviceAPI = {
  apply: (data) => api.post('/connection-requests', data),
  getMy: () => api.get('/connection-requests/me'),
  track: (id) => api.get(`/connection-requests/${id}`),
};

// ── Support ───────────────────────────────────────────────────────────────────
export const supportAPI = {
  getTickets: () => api.get('/support-tickets/me'),
  createTicket: (data) => api.post('/support-tickets', data),
  getTicket: (id) => api.get(`/support-tickets/${id}`),
  addMessage: (id, data) => api.post(`/support-tickets/${id}/messages`, data),
};

export default api;
