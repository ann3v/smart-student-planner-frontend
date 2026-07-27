import axios, { AxiosHeaders, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { ApiError, AuthResponse, RegisterResponse, Task, Subject, ScheduleItem, ProductivityAnalytics, TaskFilters, ScheduleCreateInput, TaskCreateInput, TaskUpdateInput } from '../types';

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


const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Allow app to react to unauthorized responses (e.g., force logout)
let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
};

// Request interceptor to add token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      if (config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = new AxiosHeaders({ Authorization: `Bearer ${token}` });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: { response?: { status?: number } }) => {
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
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => api.post<AuthResponse | RegisterResponse>('/auth/register', { email, password, name }),
  verifyCode: (email: string, code: string) => api.post<AuthResponse>('/auth/verify-code', { email, code }),
  getProfile: () => api.get<AuthResponse>('/auth/profile'),
};

// Task services
export const taskService = {
  createTask: (taskData: TaskCreateInput) => api.post<Task>('/tasks', taskData),
  getTasks: (params?: TaskFilters) => api.get<Task[]>('/tasks', { params }),
  getTodayTasks: () => api.get<Task[]>('/tasks/today'),
  getUpcomingTasks: () => api.get<Task[]>('/tasks/upcoming'),
  getTask: (id: number) => api.get<Task>(`/tasks/${id}`),
  updateTask: (id: number, taskData: TaskUpdateInput) => api.put<Task>(`/tasks/${id}`, taskData),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
  toggleTaskCompletion: (id: number) => api.patch(`/tasks/${id}/toggle`),
};

// Subject services
export const subjectService = {
  createSubject: (subjectData: Partial<Subject>) => api.post<Subject>('/subjects', subjectData),
  getSubjects: () => api.get<Subject[]>('/subjects'),
  getSubject: (id: number) => api.get<Subject>(`/subjects/${id}`),
  updateSubject: (id: number, subjectData: Partial<Subject>) => api.put<Subject>(`/subjects/${id}`, subjectData),
  deleteSubject: (id: number) => api.delete(`/subjects/${id}`),
};

// Schedule services
export const scheduleService = {
  createSchedule: (scheduleData: ScheduleCreateInput) => api.post<ScheduleItem>('/schedule', scheduleData),
  getSchedule: (params?: Record<string, unknown>) => api.get<ScheduleItem[]>('/schedule', { params }),
  getTodaySchedule: () => api.get<ScheduleItem[]>('/schedule/today'),
  getWeeklySchedule: () => api.get<Record<string, ScheduleItem[]>>('/schedule/weekly'),
  updateSchedule: (id: number, scheduleData: Partial<ScheduleCreateInput>) => api.put<ScheduleItem>(`/schedule/${id}`, scheduleData),
  deleteSchedule: (id: number) => api.delete(`/schedule/${id}`),
};

// Analytics services
export const analyticsService = {
  getProductivityAnalytics: (params?: { startDate?: string; endDate?: string }) => api.get<ProductivityAnalytics>('/analytics/productivity', { params }),
  getOverdueTasks: () => api.get<Task[]>('/analytics/overdue'),
  getWorkloadDistribution: () => api.get<Record<string, Task[]>>('/analytics/workload'),
};

export default api;