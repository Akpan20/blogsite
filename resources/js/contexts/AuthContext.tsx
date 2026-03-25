import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';

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
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // ---------- Restore token & Setup Interceptor ----------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const interceptor = api.interceptors.request.use((config) => {
      const activeToken = localStorage.getItem('token');
      if (activeToken) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
      return config;
    });

    checkAuth(); // Initial check

    return () => api.interceptors.request.eject(interceptor);
  }, []);

  // ---------- Verify authentication ----------
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/user');
      setUser(res.data);
    } catch (error: any) {
      console.error('Auth check failed:', error.response?.status);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Login ----------
  const login = async (email: string, password: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const response = await api.post('/login', { email, password });
      const { user: userData, token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  // ---------- Register ----------
  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await api.post('/register', { name, email, password, password_confirmation });
      const { user: userData, token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  // ---------- Logout ----------
  const logout = async () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);

    try {
      await api.post('/logout');
    } catch (err) {
      console.warn('Backend logout failed, but local session cleared', err);
    }

    window.location.replace('/');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};