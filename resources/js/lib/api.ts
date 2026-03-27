import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,          // sends cookies on every request
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

// ── CSRF cookie fetcher (call this before login/register) ─────────────────────
export async function initCsrf() {
  await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,        // note: plain axios, NOT the api instance
  });
}

// ── Request interceptor — attach XSRF token from cookie ──────────────────────
api.interceptors.request.use(config => {
  // Read the XSRF-TOKEN cookie Sanctum sets and forward it as a header
  const xsrf = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrf) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);
  }

  // Bearer token fallback — only if you're also supporting mobile/token auth
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;

    // Swallow logout failures — local state already cleared
    if (config?.url?.includes('/logout')) {
      console.warn('Logout request failed — likely token already expired');
      return Promise.resolve(response);
    }

    // CSRF token expired — refetch and retry the original request once
    if (response?.status === 419) {
      await initCsrf();
      return api.request(config);
    }

    // Session expired — clear and redirect
    if (response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];

      if (!window.location.pathname.match(/^\/(login|register)$/)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;