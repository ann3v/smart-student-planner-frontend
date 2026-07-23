import { useState, useCallback } from 'react';
import { analyticsService } from '../services/api';
import type { ProductivityAnalytics, Task, WorkloadDistribution } from '../types';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<ProductivityAnalytics | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [workload, setWorkload] = useState<WorkloadDistribution>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (params?: { startDate?: string; endDate?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, overdueRes, workloadRes] = await Promise.all([
        analyticsService.getProductivityAnalytics(params),
        analyticsService.getOverdueTasks(),
        analyticsService.getWorkloadDistribution(),
      ]);
      setAnalytics(analyticsRes.data);
      setOverdueTasks(overdueRes.data);
      setWorkload(workloadRes.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    overdueTasks,
    workload,
    loading,
    error,
    loadAnalytics,
  };
}
