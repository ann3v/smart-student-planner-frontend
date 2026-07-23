import { useState, useCallback, useEffect } from 'react';
import notificationService from '../services/notificationService';
import type { NotificationReminder, NotificationSettings } from '../types';

export function useNotifications() {
  const [reminders, setReminders] = useState<NotificationReminder[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [remindersCount, setRemindersCount] = useState(0);

  const loadReminders = useCallback(async () => {
    const stored = await notificationService.getStoredNotifications();
    setReminders(stored as NotificationReminder[]);
    const count = await notificationService.getRemindersCount();
    setRemindersCount(count);
  }, []);

  const loadSettings = useCallback(async () => {
    const s = await notificationService.getNotificationSettings();
    setSettings(s as NotificationSettings);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updated = await notificationService.updateNotificationSettings(newSettings);
    setSettings(updated as NotificationSettings);
  }, []);

  const cancelReminder = useCallback(async (id: string) => {
    await notificationService.cancelReminder(id);
    await loadReminders();
  }, [loadReminders]);

  const cancelTaskReminders = useCallback(async (taskId: number) => {
    await notificationService.cancelTaskReminders(taskId);
    await loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    loadReminders();
    loadSettings();
  }, [loadReminders, loadSettings]);

  return {
    reminders,
    settings,
    remindersCount,
    loadReminders,
    loadSettings,
    updateSettings,
    cancelReminder,
    cancelTaskReminders,
  };
}
