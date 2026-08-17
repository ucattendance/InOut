import axios from 'axios';
import { BASE_URL } from './api';

axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshPromise = null;

function clearSessionAndRedirect() {
  localStorage.removeItem('token');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    if (response?.status === 401) {
      const url = originalRequest?.url || '';
      const isAuthLogin = url.includes('/auth/login') || url.includes('/auth/register');
      const msg = response.data?.msg || response.data?.error || '';
      const invalidSession =
        msg === 'Token is not valid' ||
        msg === 'No token, authorization denied' ||
        response.data?.code === 'TOKEN_EXPIRED';

      if (!isAuthLogin && invalidSession) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }
    }

    if (!response || response.status !== 401 || response.data?.code !== 'TOKEN_EXPIRED') {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios
          .post(`${BASE_URL}/auth/refresh`, {})
          .then((res) => {
            localStorage.setItem('token', res.data.token);
            return res.data.token;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      const newToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshErr) {
      clearSessionAndRedirect();
      return Promise.reject(refreshErr);
    }
  }
);
