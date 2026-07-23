import { useState, useCallback } from 'react';
import { subjectService } from '../services/api';
import type { Subject } from '../types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await subjectService.getSubjects();
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubject = useCallback(async (data: { name: string; color?: string }): Promise<Subject | null> => {
    try {
      const response = await subjectService.createSubject(data);
      await loadSubjects();
      return response.data;
    } catch (err) {
      setError('Failed to create subject');
      return null;
    }
  }, [loadSubjects]);

  const updateSubject = useCallback(async (id: number, data: { name?: string; color?: string }): Promise<Subject | null> => {
    try {
      const response = await subjectService.updateSubject(id, data);
      await loadSubjects();
      return response.data;
    } catch (err) {
      setError('Failed to update subject');
      return null;
    }
  }, [loadSubjects]);

  const deleteSubject = useCallback(async (id: number): Promise<boolean> => {
    try {
      await subjectService.deleteSubject(id);
      await loadSubjects();
      return true;
    } catch (err) {
      setError('Failed to delete subject');
      return false;
    }
  }, [loadSubjects]);

  return {
    subjects,
    loading,
    error,
    loadSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
