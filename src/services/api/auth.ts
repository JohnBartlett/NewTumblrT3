import { api } from './client';
import type { User } from '@/store';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    return api.post<LoginResponse>('/auth/login', { email, password });
  },

  register: async (data: RegisterData) => {
    return api.post<LoginResponse>('/auth/register', data);
  },

  logout: async () => {
    return api.post<void>('/auth/logout', {});
  },

  refreshToken: async (token: string) => {
    return api.post<LoginResponse>('/auth/refresh', { token });
  },

  getCurrentUser: async () => {
    return api.get<User>('/auth/me');
  },
};



