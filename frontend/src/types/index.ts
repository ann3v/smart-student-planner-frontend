// ============================================================
// Smart Student Planner — Frontend Type Definitions
// ============================================================

// ============================================================
// AUTH
// ============================================================
export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  requiresVerification: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
}

// ============================================================
// TASK
// ============================================================
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subject {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: number;
  userId: number;
  subjectId: number | null;
  Subject?: Subject | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  estimatedDuration: number | null;
  completed: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSent: boolean;
  createdAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  subjectId?: number | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  estimatedDuration?: number | null;
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {
  completed?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

export interface TaskFilters {
  completed?: boolean;
  subjectId?: number;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
}

// ============================================================
// SCHEDULE
// ============================================================
export type ActivityType = 'class' | 'study' | 'break' | 'other';

export interface ScheduleItem {
  id: number;
  userId: number;
  subjectId: number | null;
  taskId: number | null;
  Subject?: Subject | null;
  Task?: Task | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  title: string;
  isRecurring: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  createdAt: string;
}

export interface ScheduleCreateInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  activityType?: ActivityType;
  subjectId?: number | null;
  taskId?: number | null;
  isRecurring?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

export interface ConflictResult {
  hasConflict: boolean;
  message?: string;
}

export type WeeklySchedule = Record<number, ScheduleItem[]>;

// ============================================================
// ANALYTICS
// ============================================================
export interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface TaskPerDay {
  date: string;
  count: number;
}

export interface TaskByPriority {
  priority: TaskPriority;
  count: number;
}

export interface TaskBySubject {
  subjectName: string;
  subjectColor: string;
  count: number;
}

export interface StudyHoursPerDay {
  dayOfWeek: number;
  hours: number;
}

export interface ProductivityAnalytics {
  tasksPerDay: TaskPerDay[];
  completionRate: number;
  tasksByPriority: TaskByPriority[];
  tasksBySubject: TaskBySubject[];
  studyHoursPerDay: StudyHoursPerDay[];
  stats: AnalyticsStats;
}

export type WorkloadDistribution = Record<string, Task[]>;

// ============================================================
// NOTIFICATIONS
// ============================================================
export interface NotificationReminder {
  id: string;
  taskId?: number;
  scheduleId?: number;
  taskTitle?: string;
  sessionTitle?: string;
  dueDate?: string;
  sessionTime?: string;
  triggerTime?: string;
  minutesBefore: number;
  scheduledAt: string;
  type: 'task' | 'schedule' | 'custom';
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  scheduleReminders: boolean;
  customReminders: boolean;
  soundEnabled: boolean;
  badgeEnabled: boolean;
}

// ============================================================
// NAVIGATION
// ============================================================
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verify: { email: string };
  MainTabs: { screen?: string; params?: { scheduleId?: number } } | undefined;
  TaskDetail: { taskId: number };
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: { subjectId?: number };
  Schedule: { scheduleId?: number };
  Subjects: undefined;
  Analytics: undefined;
};

// ============================================================
// THEME
// ============================================================
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  background: string;
  cardBackground: string;
  modalBackground: string;
  inputBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  inputBorder: string;
  primary: string;
  primaryLight: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  classColor: string;
  studyColor: string;
  breakColor: string;
  otherColor: string;
  shadow: string;
  overlay: string;
  disabled: string;
  chartGrid: string;
  chartText: string;
}

// ============================================================
// API
// ============================================================
export interface ApiError {
  error: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}
