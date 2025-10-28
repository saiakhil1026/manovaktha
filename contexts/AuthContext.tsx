import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User, migrationService } from '../services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: 'English' | 'Hindi' | 'Telugu') => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: { language?: 'English' | 'Hindi' | 'Telugu'; theme?: 'light' | 'dark' }) => Promise<void>;
  updateUserProfile: (profile: { name?: string; bio?: string; phone?: string; dateOfBirth?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        setUser(response.user);
        
        // Check for localStorage data and migrate if needed
        if (migrationService.hasLocalStorageData()) {
          console.log('📦 Found localStorage data, initiating migration...');
          await migrationService.migrateAllData();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid token
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      
      // Check for localStorage data and migrate if needed
      if (migrationService.hasLocalStorageData()) {
        console.log('📦 Found localStorage data, initiating migration...');
        await migrationService.migrateAllData();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, language: 'English' | 'Hindi' | 'Telugu' = 'English'): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(name, email, password, language);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const updateUserPreferences = async (preferences: { language?: 'English' | 'Hindi' | 'Telugu'; theme?: 'light' | 'dark' }): Promise<void> => {
    try {
      const response = await authService.updatePreferences(preferences);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: { name?: string; bio?: string; phone?: string; dateOfBirth?: string }): Promise<void> => {
    try {
      const response = await authService.updateProfile(profile);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUserPreferences,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};