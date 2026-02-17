import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
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
  
  // PUBLIC ROUTES - pages that don't require authentication
  const isPublicPage = [
    '/',           // ← ADD THIS! Welcome page is public
    '/login', 
    '/register',
    '/about',
    '/guidelines',
    '/privacy',
    '/terms',
    '/cookies',
    '/contact',
    '/api-docs',
  ].includes(location.pathname) || 
  location.pathname.startsWith('/posts/') ||
  location.pathname.startsWith('/search') ||
  location.pathname.startsWith('/profile/') ||
  location.pathname.startsWith('/leaderboard') ||
  location.pathname.startsWith('/categories') ||
  location.pathname.startsWith('/series') ||
  location.pathname.startsWith('/subscription/plans') ||
  location.pathname.startsWith('/subscription/verify');

  // ---------- Restore token from localStorage on app start ----------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []); // runs once when provider mounts

  // ---------- Global request interceptor to always attach token ----------
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  // ---------- Verify authentication ----------
  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const res = await api.get('/user');

      if (res.data?.id) {
        console.log('User authenticated:', res.data);
        setUser(res.data);
      } else {
        console.log('No user data in response');
        setUser(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error.response?.status, error.response?.data);
      setUser(null);
      // Token is invalid – remove it
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Initial auth check on mount ----------
  useEffect(() => {
    // Only check auth if we have a token
    const token = localStorage.getItem('token');
    
    if (token) {
      // If we have a token, verify it's still valid
      checkAuth();
    } else if (isPublicPage) {
      // No token and on public page = just set loading to false
      setIsLoading(false);
    } else {
      // No token and on protected page = let ProtectedRoute handle the redirect
      setIsLoading(false);
    }
  }, []); // empty dependency = runs once on mount

  // ---------- Update loading state when navigating ----------
  useEffect(() => {
    // If navigating to a public page and we're still loading, stop loading
    if (isPublicPage && isLoading) {
      setIsLoading(false);
    }
  }, [location.pathname, isPublicPage]);

  // ---------- Login ----------
  const login = async (email: string, password: string) => {
    try {
      console.log('📡 Logging in...');
      await api.get('/sanctum/csrf-cookie');

      const response = await api.post('/login', { email, password });
      console.log('✅ Login response:', response.status, response.data);

      const { user, token } = response.data;

      if (token) {
        console.log('🔑 Saving token...');
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(user);
      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.status, error.response?.data);
      setUser(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  };

  // ---------- Register ----------
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      console.log('📡 Attempting registration...');
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log('✅ Registration API response:', response.data);
      const { user, token } = response.data;

      if (token) {
        console.log('🔑 Saving token...');
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(user);
      console.log('✅ User registered and authenticated');
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.status, error.response?.data);
      setUser(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  };

  // ---------- Logout ----------
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/logout', {});
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setIsLoading(false);
    }
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