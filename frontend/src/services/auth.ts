// src/services/auth.ts with axios
import { api } from '@/lib/axios';

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/login', credentials);
  
  // ✅ Save token from response
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};