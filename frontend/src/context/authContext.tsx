import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, setUnauthorizedHandler } from '../services/api';
import type { AuthResponse, LoginResult, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, name: string) => Promise<LoginResult>;
  verifyCode: (email: string, code: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      const { user: userData, token } = response.data as AuthResponse;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { requiresVerification?: boolean; error?: string } } }).response?.data;
      const requiresVerification = responseData?.requiresVerification;
      const errorMessage = responseData?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage, requiresVerification, email };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<LoginResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(email, password, name);
      const responseData = response.data as { requiresVerification?: boolean; user?: User; token?: string };

      // New flow: backend sends requiresVerification without token
      if (responseData.requiresVerification) {
        return { success: true, requiresVerification: true, email };
      }

      const userData = responseData.user;
      const token = responseData.token;
      if (!userData || !token) {
        throw new Error('Invalid registration response');
      }

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string): Promise<LoginResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyCode(email, code);
      const { user: userData, token } = response.data as AuthResponse;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData) as User);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  // React to any 401 unauthorized from API: force logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        verifyCode,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};