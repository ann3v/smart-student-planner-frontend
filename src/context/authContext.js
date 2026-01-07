import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      const { user: userData, token } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(email, password, name);
      const { user: userData, token } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
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
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};