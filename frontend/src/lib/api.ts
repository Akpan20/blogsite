import axios from 'axios';

// ── Instance ──────────────────────────────────────────────────────────────────

const api = axios.create({
  // Relative in dev → Vite proxy forwards to Laravel on :8000
  // Absolute in production → VITE_API_URL must be set in .env.production
  baseURL: import.meta.env.PROD && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '/api',
  withCredentials: true,
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

// ── CSRF ──────────────────────────────────────────────────────────────────────

export async function initCsrf() {
  await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

// ── Auth endpoints that must never carry a stale token ───────────────────────

const AUTH_ROUTES = ['/login', '/register', '/sanctum/csrf-cookie'];

const isAuthRoute = (url?: string) =>
  AUTH_ROUTES.some(route => url?.includes(route));

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(config => {
  // Never attach a token to auth endpoints — a stale token causes a 401
  // before the backend even checks the credentials
  if (!isAuthRoute(config.url)) {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────

api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;

    // Network/CORS error — no response from server, don't touch auth state
    if (!response) return Promise.reject(error);

    // CSRF expired — silently refresh and retry the original request once
    if (response.status === 419) {
      await initCsrf();
      return api.request(config);
    }

    // 401 on auth routes — just reject, let the login page handle the error
    if (response.status === 401 && isAuthRoute(config?.url)) {
      return Promise.reject(error);
    }

    // 401 on a protected route — only act if we actually had a token
    // (avoids redirect loops when checking auth on first load)
    if (response.status === 401) {
      const token = localStorage.getItem('auth_token');
      const isSessionCheck = config?.url === '/user';

      if (token && !isSessionCheck) {
        // Token was rejected by the backend — clear it and redirect
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];

        const onAuthPage = /^\/(login|register)$/.test(window.location.pathname);
        if (!onAuthPage) window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;