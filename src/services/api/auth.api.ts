// Dynamic API URL based on current host
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, use the same host as the frontend (works for WiFi, Tailscale, localhost)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001`;
  }
  
  // Fallback for SSR or Node environment
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface UserSession {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  emailVerified?: boolean;
  lastLoginAt?: Date | null;
  role?: UserRole;
}

export const authApi = {
  async register(data: RegisterData): Promise<UserSession> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  async login(data: LoginData): Promise<UserSession> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async getUserById(userId: string): Promise<UserSession | null> {
    const response = await fetch(`${API_URL}/api/users/${userId}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }
  },

  async requestPasswordReset(emailOrUsername: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request password reset');
    }

    return response.json();
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    return response.json();
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify email');
    }

    return response.json();
  },

  async resendVerificationEmail(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend verification email');
    }

    return response.json();
  },

  async findAccountByEmail(email: string): Promise<{ username: string; message: string }> {
    const response = await fetch(`${API_URL}/api/auth/find-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to find account');
    }

    return response.json();
  },
};

