// ============================================================
// Smart Student Planner — Frontend Constants
// ============================================================

// Priority levels and their colors
export const PRIORITY_COLORS = {
  high: '#e74c3c',
  medium: '#f39c12',
  low: '#27ae60',
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || '#95a5a6';
};

// Activity types and their colors
export const ACTIVITY_TYPES = ['class', 'study', 'break', 'other'];

export const ACTIVITY_COLORS = {
  class: '#9b59b6',
  study: '#3498db',
  break: '#2ecc71',
  other: '#f39c12',
};

export const getActivityColor = (activityType) => {
  return ACTIVITY_COLORS[activityType] || '#95a5a6';
};

export const ACTIVITY_ICONS = {
  class: 'school',
  study: 'book',
  break: 'coffee',
  other: 'event',
};

// Subject color palette
export const SUBJECT_COLOR_PALETTE = [
  '#3498db', // Blue
  '#e74c3c', // Red
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#d35400', // Dark Orange
  '#c0392b', // Dark Red
  '#27ae60', // Dark Green
  '#8e44ad', // Dark Purple
  '#16a085', // Dark Teal
  '#7f8c8d', // Gray
];

// Chart fallback colors
export const CHART_COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e67e22', '#16a085', '#8e44ad',
];

export const getChartColorByIndex = (index) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

// Task filters
export const TASK_FILTERS = ['all', 'pending', 'completed'];

// Days of the week
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time range presets for analytics
export const TIME_RANGES = ['week', 'month', 'semester'];

// Reminder presets for tasks
export const TASK_REMINDER_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
  { label: 'Custom', value: 'custom' },
];

// Reminder presets for schedule
export const SCHEDULE_REMINDER_OPTIONS = [5, 10, 15, 30];

// Estimated duration presets (minutes)
export const DURATION_PRESETS = [30, 60, 90, 120];

// Default subject color
export const DEFAULT_SUBJECT_COLOR = '#3498db';

// Default schedule time range (8 AM to 10 PM)
export const SCHEDULE_TIME_RANGE = {
  start: 8,
  end: 22,
};

// Schedule activity types
export const SCHEDULE_ACTIVITY_TYPES = ['class', 'study', 'break', 'other'];

// FAB button shared styles (spread into component styles)
export const FAB_STYLE = {
  position: 'absolute',
  right: 20,
  bottom: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#5A9FFF',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#5A9FFF',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.35,
  shadowRadius: 5,
  elevation: 6,
};