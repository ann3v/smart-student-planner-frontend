import { useState, useCallback } from 'react';
import { taskService } from '../services/api';
import type { Task, TaskCreateInput, TaskFilters } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (filters?: TaskFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasks(filters);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: TaskCreateInput): Promise<Task | null> => {
    try {
      const response = await taskService.createTask(taskData);
      await loadTasks();
      return response.data;
    } catch (err) {
      setError('Failed to create task');
      return null;
    }
  }, [loadTasks]);

  const updateTask = useCallback(async (id: number, taskData: Partial<TaskCreateInput>): Promise<Task | null> => {
    try {
      const response = await taskService.updateTask(id, taskData);
      await loadTasks();
      return response.data;
    } catch (err) {
      setError('Failed to update task');
      return null;
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      await taskService.deleteTask(id);
      await loadTasks();
      return true;
    } catch (err) {
      setError('Failed to delete task');
      return false;
    }
  }, [loadTasks]);

  const toggleCompletion = useCallback(async (id: number): Promise<void> => {
    try {
      await taskService.toggleTaskCompletion(id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      setError('Failed to toggle task');
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleCompletion,
  };
}
