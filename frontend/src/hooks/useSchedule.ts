import { useState, useCallback } from 'react';
import { scheduleService } from '../services/api';
import type { ScheduleItem, ScheduleCreateInput, WeeklySchedule } from '../types';

export function useSchedule() {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklySchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleService.getWeeklySchedule();
      setWeeklySchedule(response.data);
    } catch (err) {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (data: ScheduleCreateInput): Promise<ScheduleItem | null> => {
    try {
      const response = await scheduleService.createSchedule(data);
      await loadWeeklySchedule();
      return response.data;
    } catch (err) {
      setError('Failed to create schedule item');
      return null;
    }
  }, [loadWeeklySchedule]);

  const updateSchedule = useCallback(async (id: number, data: Partial<ScheduleCreateInput>): Promise<ScheduleItem | null> => {
    try {
      const response = await scheduleService.updateSchedule(id, data);
      await loadWeeklySchedule();
      return response.data;
    } catch (err) {
      setError('Failed to update schedule item');
      return null;
    }
  }, [loadWeeklySchedule]);

  const deleteSchedule = useCallback(async (id: number): Promise<boolean> => {
    try {
      await scheduleService.deleteSchedule(id);
      await loadWeeklySchedule();
      return true;
    } catch (err) {
      setError('Failed to delete schedule item');
      return false;
    }
  }, [loadWeeklySchedule]);

  return {
    weeklySchedule,
    loading,
    error,
    loadWeeklySchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
