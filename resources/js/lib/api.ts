import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// lib/api.ts or wherever your axios instance lives
api.interceptors.response.use(
  response => response,
  error => {
    const config = error.config;

    // ── Special handling for logout ────────────────────────────────
    if (config?.url?.includes('/logout')) {
      // NEVER redirect or touch storage on logout failures
      // We already cleared locally — just swallow or log
      console.warn('Logout request failed (normal if token already cleared)', error);
      return Promise.reject(error); // or return Promise.resolve() if you want to fake success
    }

    // ── Normal 401 handling for ALL OTHER requests ─────────────────
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];

      // Only redirect if not already on auth pages
      if (!window.location.pathname.match(/^(\/login|\/register)$/)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;