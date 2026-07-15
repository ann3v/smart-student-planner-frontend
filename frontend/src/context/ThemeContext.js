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
  background: '#0f0f0f',
  cardBackground: '#1a1a1a',
  modalBackground: '#252525',
  inputBackground: '#252525',
  
  // Text colors
  text: '#f5f5f5',
  textSecondary: '#b8b8b8',
  textTertiary: '#888',
  
  // Border colors
  border: '#2a2a2a',
  borderLight: '#1f1f1f',
  inputBorder: '#3a3a3a',
  
  // Primary colors
  primary: '#5A9FFF',
  primaryLight: '#1e3a52',
  
  // Status colors
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  
  // Activity colors
  classColor: '#9b59b6',
  studyColor: '#3498db',
  breakColor: '#2ecc71',
  otherColor: '#f39c12',
  
  // UI elements
  shadow: 'rgba(0, 0, 0, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.85)',
  disabled: '#666',
  
  // Chart colors
  chartGrid: '#2a2a2a',
  chartText: '#b8b8b8',
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
