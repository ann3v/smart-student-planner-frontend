import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.scheduledNotifications = [];
    this.notificationPermission = null;
  }

  /**
   * Request notification permissions from user
   */
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      this.notificationPermission = status === 'granted';
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled() {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.granted;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for a task deadline
   * @param {number} taskId - Task ID
   * @param {string} taskTitle - Task title
   * @param {Date} dueDate - Due date of the task
   * @param {number} minutesBefore - Minutes before deadline to notify
   * @param {string} taskDescription - Task description
   * @returns {Promise<string>} Notification ID
   */
  async scheduleTaskReminder(taskId, taskTitle, dueDate, minutesBefore = 30, taskDescription = '') {
    try {
      const enabled = await this.areNotificationsEnabled();
      if (!enabled) {
        console.warn('Notifications are not enabled');
        return null;
      }

      const notificationTime = moment(dueDate).subtract(minutesBefore, 'minutes');

      // Check if the notification time is in the future
      if (notificationTime.isBefore(moment())) {
        console.warn('Notification time is in the past');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Task Reminder',
          body: `${taskTitle} is due in ${minutesBefore} minutes`,
          subtitle: taskDescription || 'Check your pending tasks',
          data: {
            taskId,
            type: 'task-reminder',
            dueDate: dueDate.toISOString(),
          },
          badge: 1,
        },
        trigger: {
          date: notificationTime.toDate(),
        },
      });

      // Store notification details locally
      await this.storeNotification({
        id: notificationId,
        taskId,
        taskTitle,
        dueDate: dueDate.toISOString(),
        minutesBefore,
        scheduledAt: moment().toISOString(),
        type: 'task',
      });

      console.log(`Task reminder scheduled: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for a schedule/class session
   * @param {number} scheduleId - Schedule ID
   * @param {string} sessionTitle - Session title
   * @param {Date} sessionTime - Session start time
   * @param {number} minutesBefore - Minutes before session to notify
   * @returns {Promise<string>} Notification ID
   */
  async scheduleSessionReminder(scheduleId, sessionTitle, sessionTime, minutesBefore = 15) {
    try {
      const enabled = await this.areNotificationsEnabled();
      if (!enabled) {
        console.warn('Notifications are not enabled');
        return null;
      }

      const notificationTime = moment(sessionTime).subtract(minutesBefore, 'minutes');

      if (notificationTime.isBefore(moment())) {
        console.warn('Notification time is in the past');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Session Starting Soon',
          body: `${sessionTitle} starts in ${minutesBefore} minutes`,
          subtitle: 'Get ready for your study session',
          data: {
            scheduleId,
            type: 'schedule-reminder',
            sessionTime: sessionTime.toISOString(),
          },
          badge: 1,
        },
        trigger: {
          date: notificationTime.toDate(),
        },
      });

      // Store notification details locally
      await this.storeNotification({
        id: notificationId,
        scheduleId,
        sessionTitle,
        sessionTime: sessionTime.toISOString(),
        minutesBefore,
        scheduledAt: moment().toISOString(),
        type: 'schedule',
      });

      console.log(`Session reminder scheduled: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling session reminder:', error);
      return null;
    }
  }

  /**
   * Schedule a custom reminder
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Date} triggerTime - When to trigger the notification
   * @param {object} data - Custom data to attach to notification
   * @returns {Promise<string>} Notification ID
   */
  async scheduleCustomReminder(title, body, triggerTime, data = {}) {
    try {
      const enabled = await this.areNotificationsEnabled();
      if (!enabled) {
        console.warn('Notifications are not enabled');
        return null;
      }

      if (moment(triggerTime).isBefore(moment())) {
        console.warn('Trigger time is in the past');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'custom-reminder',
            ...data,
          },
          badge: 1,
        },
        trigger: {
          date: new Date(triggerTime),
        },
      });

      await this.storeNotification({
        id: notificationId,
        title,
        body,
        triggerTime: moment(triggerTime).toISOString(),
        scheduledAt: moment().toISOString(),
        type: 'custom',
        data,
      });

      console.log(`Custom reminder scheduled: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling custom reminder:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param {string} notificationId - ID of the notification to cancel
   */
  async cancelReminder(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeStoredNotification(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all reminders for a specific task
   * @param {number} taskId - Task ID
   */
  async cancelTaskReminders(taskId) {
    try {
      const notifications = await this.getStoredNotifications();
      const taskNotifications = notifications.filter(n => n.taskId === taskId);

      for (const notification of taskNotifications) {
        await this.cancelReminder(notification.id);
      }
    } catch (error) {
      console.error('Error cancelling task reminders:', error);
    }
  }

  /**
   * Cancel all reminders for a specific schedule
   * @param {number} scheduleId - Schedule ID
   */
  async cancelScheduleReminders(scheduleId) {
    try {
      const notifications = await this.getStoredNotifications();
      const scheduleNotifications = notifications.filter(n => n.scheduleId === scheduleId);

      for (const notification of scheduleNotifications) {
        await this.cancelReminder(notification.id);
      }
    } catch (error) {
      console.error('Error cancelling schedule reminders:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Store notification in AsyncStorage for reference
   */
  async storeNotification(notification) {
    try {
      const key = 'scheduled_notifications';
      const stored = await AsyncStorage.getItem(key);
      const notifications = stored ? JSON.parse(stored) : [];
      notifications.push({
        ...notification,
        createdAt: moment().toISOString(),
      });
      await AsyncStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get stored notifications from AsyncStorage
   */
  async getStoredNotifications() {
    try {
      const key = 'scheduled_notifications';
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving stored notifications:', error);
      return [];
    }
  }

  /**
   * Remove a stored notification
   */
  async removeStoredNotification(notificationId) {
    try {
      const key = 'scheduled_notifications';
      const stored = await AsyncStorage.getItem(key);
      const notifications = stored ? JSON.parse(stored) : [];
      const filtered = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing stored notification:', error);
    }
  }

  /**
   * Get count of active reminders
   */
  async getRemindersCount() {
    try {
      const notifications = await this.getStoredNotifications();
      const activeReminders = notifications.filter(n => {
        const triggerTime = moment(n.dueDate || n.sessionTime || n.triggerTime);
        return triggerTime.isAfter(moment());
      });
      return activeReminders.length;
    } catch (error) {
      console.error('Error getting reminders count:', error);
      return 0;
    }
  }

  /**
   * Get active reminders for a task
   */
  async getTaskReminders(taskId) {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications.filter(n => n.taskId === taskId && n.type === 'task');
    } catch (error) {
      console.error('Error getting task reminders:', error);
      return [];
    }
  }

  /**
   * Reschedule a notification
   */
  async rescheduleReminder(notificationId, newTriggerTime) {
    try {
      const notifications = await this.getStoredNotifications();
      const notification = notifications.find(n => n.id === notificationId);

      if (!notification) {
        console.error('Notification not found');
        return null;
      }

      // Cancel old notification
      await this.cancelReminder(notificationId);

      // Schedule new one based on type
      let newId;
      if (notification.type === 'task') {
        newId = await this.scheduleTaskReminder(
          notification.taskId,
          notification.taskTitle,
          new Date(newTriggerTime),
          notification.minutesBefore
        );
      } else if (notification.type === 'schedule') {
        newId = await this.scheduleSessionReminder(
          notification.scheduleId,
          notification.sessionTitle,
          new Date(newTriggerTime),
          notification.minutesBefore
        );
      } else if (notification.type === 'custom') {
        newId = await this.scheduleCustomReminder(
          notification.title,
          notification.body,
          newTriggerTime,
          notification.data
        );
      }

      return newId;
    } catch (error) {
      console.error('Error rescheduling reminder:', error);
      return null;
    }
  }

  /**
   * Get user's notification settings
   */
  async getNotificationSettings() {
    try {
      const key = 'notification_settings';
      const stored = await AsyncStorage.getItem(key);
      return stored
        ? JSON.parse(stored)
        : {
            enabled: true,
            taskReminders: true,
            scheduleReminders: true,
            customReminders: true,
            soundEnabled: true,
            badgeEnabled: true,
          };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings) {
    try {
      const key = 'notification_settings';
      const currentSettings = await this.getNotificationSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(key, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new NotificationService();
