import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('erlbUser');
  if (userInfo) {
    const token = JSON.parse(userInfo).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
