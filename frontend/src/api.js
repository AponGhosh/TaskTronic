import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getTasks = () => api.get('/api/tasks');
export const addTask = (payload) => api.post('/api/tasks', payload);
export const updateTask = (id, payload) => api.put(`/api/tasks/${id}`, payload);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const health = () => api.get('/api/health');

export default api;
