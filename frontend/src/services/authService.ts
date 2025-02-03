import apiClient from './apiClient';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterData) => apiClient.post('/register', data),
  login: (data: LoginData) => apiClient.post('/login', data),
};
