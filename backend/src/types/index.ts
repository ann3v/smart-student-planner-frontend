// ============================================================
// Smart Student Planner — Backend Type Definitions
// ============================================================

import { Request } from 'express';

// ============================================================
// AUTH
// ============================================================

export interface AuthRequest extends Request {
  user?: UserAttributes;
  token?: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyCodeBody {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export interface RegisterResponse {
  message: string;
  requiresVerification: boolean;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

// ============================================================
// USER
// ============================================================

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string | null;
  isVerified: boolean;
  verificationCodeHash: string | null;
  verificationExpiresAt: Date | null;
  failedLoginAttempts: number;
  failedVerificationAttempts: number;
  lockoutUntil: Date | null;
  createdAt: Date;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string | null;
}

// ============================================================
// TASK
// ============================================================

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAttributes {
  id: number;
  userId: number;
  subjectId: number | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedDuration: number | null;
  completed: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSent: boolean;
  createdAt: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  subjectId?: number | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  estimatedDuration?: number | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  subjectId?: number | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  estimatedDuration?: number | null;
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
// SUBJECT
// ============================================================

export interface SubjectAttributes {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
}

export interface SubjectCreateInput {
  name: string;
  color?: string;
}

export interface SubjectUpdateInput {
  name?: string;
  color?: string;
}

// ============================================================
// SCHEDULE
// ============================================================

export type ActivityType = 'class' | 'study' | 'break' | 'other';

export interface ScheduleAttributes {
  id: number;
  userId: number;
  subjectId: number | null;
  taskId: number | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
  title: string;
  isRecurring: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  createdAt: Date;
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

export interface ScheduleUpdateInput {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  title?: string;
  activityType?: ActivityType;
  subjectId?: number | null;
  taskId?: number | null;
  isRecurring?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

export interface WeeklySchedule {
  [dayOfWeek: number]: ScheduleAttributes[];
}

export interface ConflictResult {
  hasConflict: boolean;
  message?: string;
}

// ============================================================
// ANALYTICS
// ============================================================

export interface ProductivityAnalytics {
  tasksPerDay: TaskPerDay[];
  completionRate: number;
  tasksByPriority: TaskByPriority[];
  tasksBySubject: TaskBySubject[];
  studyHoursPerDay: StudyHoursPerDay[];
  stats: AnalyticsStats;
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

export interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface WorkloadDistribution {
  [date: string]: TaskAttributes[];
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  status?: string;
  timestamp?: string;
}