import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { taskService, subjectService } from '../services/api';
import notificationService from '../services/notificationService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, formatDateShort, parseDate } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

const TaskDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [taskReminders, setTaskReminders] = useState([]);
  const [reminderMinutes, setReminderMinutes] = useState('30');

  const REMINDER_OPTIONS = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1 day', value: 1440 },
    { label: 'Custom', value: 'custom' }
  ];

  useEffect(() => {
    loadTask();
    loadSubjects();
    loadTaskReminders();
  }, []);

  // Refresh task details and reminders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTask();
      loadTaskReminders();
    }, [taskId])
  );

  const loadTask = async () => {
    try {
      const response = await taskService.getTask(taskId);
      setTask(response.data);
      setEditedTask(response.data);
    } catch (error) {
      console.error('Failed to load task:', error);
      Alert.alert('Error', 'Failed to load task details');
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadTaskReminders = async () => {
    try {
      const reminders = await notificationService.getTaskReminders(taskId);
      setTaskReminders(reminders);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const handleToggleCompletion = async () => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      loadTask(); // Reload to get updated task
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      await taskService.updateTask(taskId, editedTask);
      setIsEditing(false);
      Alert.alert('Success', 'Task updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleScheduleReminder = async (minutes) => {
    try {
      if (!task.dueDate) {
        Alert.alert('Error', 'Please set a due date before scheduling a reminder');
        return;
      }

      const notificationId = await notificationService.scheduleTaskReminder(
        taskId,
        task.title,
        new Date(task.dueDate),
        minutes,
        task.description
      );

      if (notificationId) {
        await loadTaskReminders();
        setShowReminderModal(false);
        Alert.alert('Success', `Reminder scheduled for ${minutes} minutes before deadline`);
      } else {
        Alert.alert('Error', 'Failed to schedule reminder');
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to schedule reminder');
    }
  };

  const handleCancelReminder = async (reminderId) => {
    try {
      await notificationService.cancelReminder(reminderId);
      await loadTaskReminders();
      Alert.alert('Success', 'Reminder cancelled');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel reminder');
    }
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const formatDateLocal = (dateString) => {
    if (!dateString) return 'No due date';
    const date = parseDate(dateString);
    if (!date) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#3498db';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'No subject';
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = editedTask.dueDate ? new Date(editedTask.dueDate) : new Date();
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setEditedTask({ ...editedTask, dueDate: currentDate.toISOString() });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = editedTask.dueDate ? new Date(editedTask.dueDate) : new Date();
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setEditedTask({ ...editedTask, dueDate: currentDate.toISOString() });
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.text }}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={20} color={theme.primary} />
              <Text style={[styles.editButtonText, { color: theme.primary }]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteTask}>
              <Icon name="delete" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Task Title */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          {isEditing ? (
            <TextInput
              style={[styles.titleInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Task title"
              placeholderTextColor={theme.textTertiary}
              value={editedTask.title}
              onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
            />
          ) : (
            <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
          )}
          
          <TouchableOpacity
            style={[styles.completionButton, { backgroundColor: theme.background }, task.completed && styles.completedButton]}
            onPress={handleToggleCompletion}
          >
            <Icon
              name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
              size={20}
              color={task.completed ? '#27ae60' : theme.primary}
            />
            <Text style={[styles.completionText, { color: theme.text }, task.completed && styles.completedText]}>
              {task.completed ? 'Completed' : 'Mark as complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Details */}
        <View style={[styles.detailsContainer, { backgroundColor: theme.cardBackground }]}>
          {/* Description */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.descriptionInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={editedTask.description || ''}
                onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                placeholder="Add description..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {task.description || 'No description added'}
              </Text>
            )}
          </View>

          {/* Subject */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Subject</Text>
            {isEditing ? (
              <View style={styles.subjectSelector}>
                {subjects.map(subject => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectOption,
                      editedTask.subjectId === subject.id && styles.selectedSubjectOption,
                      { backgroundColor: subject.color }
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, subjectId: subject.id })}
                  >
                    <Text style={styles.subjectOptionText}>{subject.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.subjectTag, { backgroundColor: getSubjectColor(task.subjectId) }]}>
                <Text style={styles.subjectTagText}>{getSubjectName(task.subjectId)}</Text>
              </View>
            )}
          </View>

          {/* Priority */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Priority</Text>
            {isEditing ? (
              <View style={styles.prioritySelector}>
                {['low', 'medium', 'high'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      editedTask.priority === priority && styles.selectedPriorityOption,
                      { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, priority })}
                  >
                    <Text style={styles.priorityOptionText}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityTagText}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Due Date */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Due Date & Time</Text>
            {isEditing ? (
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color={theme.primary} />
                  <Text style={[styles.dateTimeButtonText, { color: theme.text }]}>
                    {editedTask.dueDate ? formatDateLocal(editedTask.dueDate) : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="access-time" size={20} color={theme.primary} />
                  <Text style={[styles.dateTimeButtonText, { color: theme.text }]}>
                    {editedTask.dueDate ? formatTime(editedTask.dueDate) : 'Select Time'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editedTask.dueDate ? parseDate(editedTask.dueDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    textColor={theme.text}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={editedTask.dueDate ? parseDate(editedTask.dueDate) : new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    textColor={theme.text}
                  />
                )}
              </View>
            ) : (
              <View style={styles.dateTimeDisplay}>
                <Icon name="calendar-today" size={20} color={theme.primary} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {task.dueDate ? formatDateLocal(task.dueDate) : 'No due date'}
                </Text>
                {task.dueDate && (
                  <>
                    <Icon name="access-time" size={20} color={theme.primary} style={styles.timeIcon} />
                    <Text style={[styles.dateTimeText, { color: theme.text }]}>{formatTime(task.dueDate)}</Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Created Date */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDateLocal(task.createdAt)}
            </Text>
          </View>

          {/* Estimated Duration */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Estimated Duration</Text>
            {isEditing ? (
              <View style={styles.durationSelector}>
                {[30, 60, 90, 120].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.durationOption,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      editedTask.estimatedDuration === minutes && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, estimatedDuration: minutes })}
                  >
                    <Text style={[styles.durationOptionText, editedTask.estimatedDuration === minutes && { color: '#fff' }, editedTask.estimatedDuration !== minutes && { color: theme.text }]}>{minutes} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {task.estimatedDuration ? `${task.estimatedDuration} minutes` : 'Not specified'}
              </Text>
            )}
          </View>

          {/* Reminders Section */}
          <View style={styles.detailSection}>
            <View style={styles.reminderHeader}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Reminders</Text>
              <TouchableOpacity
                style={styles.addReminderButton}
                onPress={() => setShowReminderModal(true)}
              >
                <Icon name="add-circle" size={20} color={theme.primary} />
                <Text style={[styles.addReminderText, { color: theme.primary }]}>Add Reminder</Text>
              </TouchableOpacity>
            </View>

            {taskReminders.length > 0 ? (
              <View style={styles.remindersList}>
                {taskReminders.map((reminder) => (
                  <View key={reminder.id} style={[styles.reminderItem, { backgroundColor: theme.background, borderColor: theme.border, borderLeftColor: theme.primary }]}>
                    <View style={styles.reminderInfo}>
                      <Icon name="notifications-active" size={18} color={theme.primary} />
                      <View style={styles.reminderDetails}>
                        <Text style={[styles.reminderText, { color: theme.text }]}>
                          {reminder.minutesBefore} minutes before deadline
                        </Text>
                        <Text style={[styles.reminderTime, { color: theme.textSecondary }]}>
                          Scheduled at {new Date(reminder.scheduledAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCancelReminder(reminder.id)}
                      style={styles.cancelReminderButton}
                    >
                      <Icon name="close" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noRemindersText, { color: theme.textSecondary }]}>No reminders set</Text>
            )}

            {/* Reminder Modal */}
            <Modal
              visible={showReminderModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowReminderModal(false)}
            >
              <View style={[styles.reminderModalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.reminderModalContent, { backgroundColor: theme.cardBackground }]}>
                  <View style={styles.reminderModalHeader}>
                    <Text style={[styles.reminderModalTitle, { color: theme.text }]}>Set a Reminder</Text>
                    <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                      <Icon name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.reminderModalSubtitle, { color: theme.textSecondary }]}>
                    Choose when to be reminded before the deadline:
                  </Text>

                  <View style={styles.reminderOptionsContainer}>
                    {REMINDER_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.reminderOption, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => {
                          if (option.value === 'custom') {
                            // Handle custom reminder
                            setShowReminderModal(false);
                          } else {
                            handleScheduleReminder(option.value);
                          }
                        }}
                      >
                        <Icon name="schedule" size={24} color={theme.primary} />
                        <Text style={[styles.reminderOptionText, { color: theme.text }]}>{option.label}</Text>
                        <Icon name="chevron-right" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {!task.dueDate && (
                    <Text style={[
                      styles.dueDataWarning,
                      { color: theme.warning, backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'transparent' },
                      { backgroundColor: (theme.background === '#0f0f0f' ? 'rgba(243, 156, 18, 0.15)' : '#fff4e5') }
                    ]}>
                      ⚠️ Please set a due date to schedule reminders
                    </Text>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        </View>

        {/* Save Button (when editing) */}
        {isEditing && (
          <View style={[styles.saveSection, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleUpdateTask}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  editButtonText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completedButton: {
    opacity: 0.7,
  },
  completionText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  completedText: {
    color: '#27ae60',
  },
  detailsContainer: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  subjectTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  subjectTagText: {
    color: '#fff',
    fontWeight: '500',
  },
  priorityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  priorityTagText: {
    color: '#fff',
    fontWeight: '500',
  },
  dateTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 16,
  },
  timeIcon: {
    marginLeft: 20,
  },
  subjectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedSubjectOption: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  subjectOptionText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  selectedPriorityOption: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  priorityOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  dateTimeContainer: {
    gap: 10,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeButtonText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDurationOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  durationOptionText: {
    color: '#333',
  },
  selectedDurationOptionText: {
    color: '#fff',
  },
  saveSection: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 6,
  },
  addReminderText: {
    marginLeft: 6,
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  remindersList: {
    gap: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reminderTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  cancelReminderButton: {
    padding: 8,
  },
  noRemindersText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  reminderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reminderModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  reminderModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reminderModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  reminderOptionsContainer: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reminderOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  dueDataWarning: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 16,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
  },
});

export default TaskDetailScreen;