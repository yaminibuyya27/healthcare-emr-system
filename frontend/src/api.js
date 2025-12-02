import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.user_id) {
    config.headers['x-user-id'] = user.user_id;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => api.post('/login', { username, password })
};

export const patientsAPI = {
  getAll: () => api.get('/patients/all'),
  search: (query) => api.get(`/patients/search?q=${query}`),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data)
};

export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

export const doctorsAPI = {
  getAll: () => api.get('/doctors')
};

export const prescriptionsAPI = {
  create: (data) => api.post('/prescriptions', data),
  getAll: () => api.get('/prescriptions'),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`)
};

export const medicationsAPI = {
  getAll: () => api.get('/medications')
};

export default api;
