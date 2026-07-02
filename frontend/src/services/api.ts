import axios from 'axios';

const API_BASE_URL = 'https://room-rental-project.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ssrms_token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('ssrms_admin');
      localStorage.removeItem('ssrms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;