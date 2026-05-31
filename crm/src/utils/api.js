import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/admin/login', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard'),
};

export const driversAPI = {
  getAll: (params) => api.get('/drivers', { params }),
  getOne: (id) => api.get(`/drivers/${id}`),
  getStats: (id) => api.get(`/drivers/${id}/stats`),
  verify: (id, is_verified) => api.put(`/drivers/${id}/verify`, { is_verified }),
};

export const tripsAPI = {
  getAll: (params) => api.get('/trips', { params }),
};

export const passengersAPI = {
  // passengers CRUD shu yerda bo'ladi
};

export default api;
