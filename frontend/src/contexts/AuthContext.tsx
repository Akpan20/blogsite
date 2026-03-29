import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { initCsrf } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role?: string;
  is_admin?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user:      User | null;
  isLoading: boolean;
  login:     (email: string, password: string) => Promise<void>;
  register:  (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout:    () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on first mount
  useEffect(() => { checkAuth(); }, []);

  // ── checkAuth ───────────────────────────────────────────────────────────────
  // Verifies whether the stored token is still valid.
  // Safe to call multiple times — the interceptor will NOT redirect on a /user 401.

  const checkAuth = async () => {
    setIsLoading(true);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // No token stored — user is definitely not logged in
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Put token on defaults before the request fires
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const { data } = await api.get('/user');
      setUser(data);
    } catch {
      // Token was rejected or expired — wipe it so it can't pollute future requests
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ── login ───────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    // Always wipe any stale token BEFORE logging in.
    // A leftover invalid token would be attached to the login request
    // by the interceptor and cause a 401 before credentials are checked.
    clearToken();

    await initCsrf();

    const { data } = await api.post('/login', { email, password });
    const { user: userData, token } = data;

    if (!token) throw new Error('No token returned from server');

    saveToken(token);
    setUser(userData);
  };

  // ── register ────────────────────────────────────────────────────────────────

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    clearToken();
    await initCsrf();

    const { data } = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });

    const { user: userData, token } = data;
    if (!token) throw new Error('No token returned from server');

    saveToken(token);
    setUser(userData);
  };

  // ── logout ──────────────────────────────────────────────────────────────────

  const logout = async () => {
    // Clear local state first so UI responds immediately
    clearToken();
    setUser(null);

    try {
      await api.post('/logout');
    } catch {
      // Token may already be invalid server-side — local clear is enough
    }

    window.location.replace('/login');
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};