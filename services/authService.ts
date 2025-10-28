import { apiClient } from './apiClient';

export interface AuthResponse {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    preferences: {
      language: 'English' | 'Hindi' | 'Telugu';
      theme: 'light' | 'dark';
    };
    profile?: {
      avatar?: string;
      bio?: string;
      dateOfBirth?: string;
      phone?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: {
    language: 'English' | 'Hindi' | 'Telugu';
    theme: 'light' | 'dark';
  };
  profile?: {
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  async register(name: string, email: string, password: string, language: 'English' | 'Hindi' | 'Telugu' = 'English'): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      language
    });
    
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me');
  }

  async updatePreferences(preferences: { language?: 'English' | 'Hindi' | 'Telugu'; theme?: 'light' | 'dark' }): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>('/auth/preferences', preferences);
  }

  async updateProfile(profile: { name?: string; bio?: string; phone?: string; dateOfBirth?: string }): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>('/auth/profile', profile);
  }

  logout(): void {
    apiClient.clearToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();