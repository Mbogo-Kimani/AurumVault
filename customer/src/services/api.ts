import axios from 'axios';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://aurumvault-w632.onrender.com/api';
  if (url.endsWith('/api')) return url;
  if (url.endsWith('/')) return `${url}api`;
  return `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
