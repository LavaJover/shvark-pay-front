import axios from 'axios';
import { toast } from 'react-toastify';
import { loadingManager } from '../utils/loadingManager';

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  loadingManager.start();

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  loadingManager.stop();
  toast.error('Ошибка запроса');
  return Promise.reject(error);
});

api.interceptors.response.use(
  (res) => {
    loadingManager.stop();
    return res;
  },
  (error) => {
    loadingManager.stop();

    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        toast.warn('Сессия истекла. Войдите снова.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(data?.message || 'Произошла ошибка');
      }
    } else {
      toast.error('Сервер недоступен');
    }

    return Promise.reject(error);
  }
);

export default api;