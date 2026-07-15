import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL configuration:
// - Android emulator uses 10.0.2.2 to reach host machine's localhost
// - iOS simulator can use localhost directly
// - Physical devices should use the actual machine IP or deployed server URL
// - In production, this should be your deployed server URL
const getDefaultApiUrl = () => {
  if (__DEV__) {
    // Development: use appropriate local address based on platform
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }
  // Production: use deployed server URL
  return 'https://your-production-server.com/api';
};

// Allow override via Expo Constants or manual config
const API_URL = getDefaultApiUrl();


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Allow app to react to unauthorized responses (e.g., force logout)
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
};

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
      if (unauthorizedHandler) {
        try {
          unauthorizedHandler();
        } catch {}
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  getProfile: () => api.get('/auth/profile'),
};

// Task services
export const taskService = {
  createTask: (taskData) => api.post('/tasks', taskData),
  getTasks: (params) => api.get('/tasks', { params }),
  getTodayTasks: () => api.get('/tasks/today'),
  getUpcomingTasks: () => api.get('/tasks/upcoming'),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleTaskCompletion: (id) => api.patch(`/tasks/${id}/toggle`),
};

// Subject services
export const subjectService = {
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  updateSubject: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

// Schedule services
export const scheduleService = {
  createSchedule: (scheduleData) => api.post('/schedule', scheduleData),
  getSchedule: (params) => api.get('/schedule', { params }),
  getTodaySchedule: () => api.get('/schedule/today'),
  getWeeklySchedule: () => api.get('/schedule/weekly'),
  updateSchedule: (id, scheduleData) => api.put(`/schedule/${id}`, scheduleData),
  deleteSchedule: (id) => api.delete(`/schedule/${id}`),
};

// Analytics services
export const analyticsService = {
  getProductivityAnalytics: (params) => api.get('/analytics/productivity', { params }),
  getOverdueTasks: () => api.get('/analytics/overdue'),
  getWorkloadDistribution: () => api.get('/analytics/workload'),
};

export default api;