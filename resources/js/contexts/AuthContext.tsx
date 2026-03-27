import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { initCsrf } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role?: string;
  is_admin?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Run once on mount — restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    checkAuth();
  }, []); // no interceptor registered here — api.ts handles that already

  // ── Verify session ──────────────────────────────────────────────────────────
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/user');
      setUser(data);
    } catch (error: any) {
      console.warn('Session check failed:', error.response?.status);
      clearLocalAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    // Always fetch a fresh CSRF cookie before any auth mutation
    await initCsrf();

    const { data } = await api.post('/login', { email, password });
    const { user: userData, token } = data;

    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setUser(userData);
  };

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    await initCsrf();

    const { data } = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });

    const { user: userData, token } = data;

    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setUser(userData);
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    // Clear local state first so UI reacts immediately
    clearLocalAuth();

    try {
      await api.post('/logout');
    } catch (err) {
      // Token may already be invalid — local clear is enough
      console.warn('Backend logout failed, local session already cleared', err);
    }

    window.location.replace('/');
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearLocalAuth = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};