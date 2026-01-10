import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const lightTheme = {
  // Background colors
  background: '#f8f9fb',
  cardBackground: '#fff',
  modalBackground: '#fff',
  inputBackground: '#fafbfc',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#666',
  textTertiary: '#999',
  
  // Border colors
  border: '#eee',
  borderLight: '#f0f1f3',
  inputBorder: '#e0e0e0',
  
  // Primary colors
  primary: '#4A90E2',
  primaryLight: '#f0f7ff',
  
  // Status colors
  success: '#2ecc71',
  danger: '#ff6b6b',
  warning: '#f39c12',
  info: '#3498db',
  
  // Activity colors
  classColor: '#9b59b6',
  studyColor: '#3498db',
  breakColor: '#2ecc71',
  otherColor: '#f39c12',
  
  // UI elements
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.45)',
  disabled: '#95a5a6',
  
  // Chart colors
  chartGrid: '#f0f0f0',
  chartText: '#666',
};

export const darkTheme = {
  // Background colors
  background: '#121212',
  cardBackground: '#1e1e1e',
  modalBackground: '#2a2a2a',
  inputBackground: '#2a2a2a',
  
  // Text colors
  text: '#e8e8e8',
  textSecondary: '#b0b0b0',
  textTertiary: '#888',
  
  // Border colors
  border: '#333',
  borderLight: '#2a2a2a',
  inputBorder: '#444',
  
  // Primary colors
  primary: '#4A90E2',
  primaryLight: '#1a3a5a',
  
  // Status colors
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#e67e22',
  info: '#2980b9',
  
  // Activity colors
  classColor: '#8e44ad',
  studyColor: '#2980b9',
  breakColor: '#27ae60',
  otherColor: '#d68910',
  
  // UI elements
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: '#7f8c8d',
  
  // Chart colors
  chartGrid: '#333',
  chartText: '#b0b0b0',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        const { mode } = JSON.parse(savedTheme);
        setThemeMode(mode);
        if (mode !== 'system') {
          setIsDark(mode === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setTheme = async (mode) => {
    try {
      setThemeMode(mode);
      if (mode === 'light') {
        setIsDark(false);
      } else if (mode === 'dark') {
        setIsDark(true);
      } else {
        setIsDark(systemColorScheme === 'dark');
      }
      await AsyncStorage.setItem('theme_preference', JSON.stringify({ mode }));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
