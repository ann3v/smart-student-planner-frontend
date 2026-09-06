import type { ProductivityAnalytics, TaskByPriority } from '../types';

export const prepareProductivityData = (
  analytics: ProductivityAnalytics | null,
  _themeTextSecondary?: string
) => {
  if (!analytics?.tasksPerDay || analytics.tasksPerDay.length === 0) {
    return null;
  }

  const labels = analytics.tasksPerDay.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const data = analytics.tasksPerDay.map(item => {
    const val = item.count;
    return isFinite(val) ? val : 0;
  });

  if (!data.some(d => d > 0)) {
    return null;
  }

  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
};

export const prepareSubjectDistributionData = (
  analytics: ProductivityAnalytics | null,
  themeTextSecondary?: string,
  _getChartColorByIndex?: (index: number) => string
) => {
  if (!analytics?.tasksBySubject || analytics.tasksBySubject.length === 0) {
    return null;
  }

  const data = analytics.tasksBySubject
    .map((item, index) => ({
      name: item.subjectName,
      count: isFinite(item.count) ? Math.max(item.count, 0) : 0,
      color: item.subjectColor || (_getChartColorByIndex ? _getChartColorByIndex(index) : '#4A90E2'),
      legendFontColor: themeTextSecondary || '#666',
      legendFontSize: 12,
    }))
    .filter(item => item.count > 0);

  return data.length > 0 ? data : null;
};

export const prepareStudyHoursData = (
  analytics: ProductivityAnalytics | null
) => {
  if (!analytics?.studyHoursPerDay || analytics.studyHoursPerDay.length === 0) {
    return null;
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = new Array(7).fill(0);

  analytics.studyHoursPerDay.forEach(item => {
    const hours = parseFloat(String(item.hours)) || 0;
    data[item.dayOfWeek] = isFinite(hours) ? hours : 0;
  });

  if (!data.some(d => d > 0)) {
    return null;
  }

  return {
    labels: days,
    datasets: [{ data }],
  };
};

export const getPriorityDistribution = (
  analytics: ProductivityAnalytics | null
): Record<string, number> | null => {
  if (!analytics?.tasksByPriority) return null;

  const priorityData: Record<string, number> = {};
  analytics.tasksByPriority.forEach((item: TaskByPriority) => {
    priorityData[item.priority] = item.count;
  });

  return priorityData;
};
