import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AuthResponse, RegisterResponse, Task, Subject, ScheduleItem, ProductivityAnalytics, TaskFilters, ScheduleCreateInput, TaskCreateInput, TaskUpdateInput } from '../types';

const getDefaultApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }
  // Production: use EXPO_PUBLIC_API_URL env var, or fallback
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-production-server.com/api';
};

const API_URL = getDefaultApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
};

// Simple in-memory cache for GET requests
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

const getCacheKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

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

    // Check cache for GET requests
    if (config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(config);
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return Promise.reject({ __cached: true, data: cached.data });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(response.config as InternalAxiosRequestConfig);
      responseCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    }
    return response;
  },
  (error) => {
    if (error.__cached) {
      return Promise.resolve({ data: error.data });
    }
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
      if (unauthorizedHandler) {
        try { unauthorizedHandler(); } catch {}
      }
    }
    return Promise.reject(error);
  }
);

// Clear cache on mutations
const clearCache = () => responseCache.clear();

// Auth services
export const authService = {
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => api.post<AuthResponse | RegisterResponse>('/auth/register', { email, password, name }),
  verifyCode: (email: string, code: string) => api.post<AuthResponse>('/auth/verify-code', { email, code }),
  getProfile: () => api.get<AuthResponse>('/auth/profile'),
};

// Task services
export const taskService = {
  createTask: (taskData: TaskCreateInput) => { clearCache(); return api.post<Task>('/tasks', taskData); },
  getTasks: (params?: TaskFilters) => api.get<Task[]>('/tasks', { params }),
  getTodayTasks: () => api.get<Task[]>('/tasks/today'),
  getUpcomingTasks: () => api.get<Task[]>('/tasks/upcoming'),
  getTask: (id: number) => api.get<Task>(`/tasks/${id}`),
  updateTask: (id: number, taskData: TaskUpdateInput) => { clearCache(); return api.put<Task>(`/tasks/${id}`, taskData); },
  deleteTask: (id: number) => { clearCache(); return api.delete(`/tasks/${id}`); },
  toggleTaskCompletion: (id: number) => { clearCache(); return api.patch(`/tasks/${id}/toggle`); },
};

// Subject services
export const subjectService = {
  createSubject: (subjectData: Partial<Subject>) => { clearCache(); return api.post<Subject>('/subjects', subjectData); },
  getSubjects: () => api.get<Subject[]>('/subjects'),
  getSubject: (id: number) => api.get<Subject>(`/subjects/${id}`),
  updateSubject: (id: number, subjectData: Partial<Subject>) => { clearCache(); return api.put<Subject>(`/subjects/${id}`, subjectData); },
  deleteSubject: (id: number) => { clearCache(); return api.delete(`/subjects/${id}`); },
};

// Schedule services
export const scheduleService = {
  createSchedule: (scheduleData: ScheduleCreateInput) => { clearCache(); return api.post<ScheduleItem>('/schedule', scheduleData); },
  getSchedule: (params?: Record<string, unknown>) => api.get<ScheduleItem[]>('/schedule', { params }),
  getTodaySchedule: () => api.get<ScheduleItem[]>('/schedule/today'),
  getWeeklySchedule: () => api.get<Record<string, ScheduleItem[]>>('/schedule/weekly'),
  updateSchedule: (id: number, scheduleData: Partial<ScheduleCreateInput>) => { clearCache(); return api.put<ScheduleItem>(`/schedule/${id}`, scheduleData); },
  deleteSchedule: (id: number) => { clearCache(); return api.delete(`/schedule/${id}`); },
};

// Analytics services
export const analyticsService = {
  getProductivityAnalytics: (params?: { startDate?: string; endDate?: string }) => api.get<ProductivityAnalytics>('/analytics/productivity', { params }),
  getOverdueTasks: () => api.get<Task[]>('/analytics/overdue'),
  getWorkloadDistribution: () => api.get<Record<string, Task[]>>('/analytics/workload'),
};

export default api;