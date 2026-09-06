import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleService, taskService, subjectService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useFocusRefresh } from '../hooks/useFocusRefresh';
import { useSchedule } from '../hooks/useSchedule';
import { useForm } from '../hooks/useForm';
import { FAB } from '../components';
import { getActivityColor } from '../utils/constants';
import { checkScheduleConflict, formatTime, timeStringToDate, dateToTimeString } from '../utils/scheduleUtils';
import type { ActivityType, ScheduleItem, Subject, Task, ScheduleCreateInput } from '../types';

const ScheduleScreen = () => {
  const { theme } = useTheme();
  const { weeklySchedule, loadWeeklySchedule } = useSchedule();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState('startTime');
  const [tempTime, setTempTime] = useState(new Date());
  const form = useForm<ScheduleCreateInput & { dayOfWeek: number; title: string; activityType: ActivityType; startTime: string; endTime: string; subjectId: number | null; taskId: number | null; isRecurring: boolean; reminderEnabled: boolean; reminderMinutesBefore: number }>({
    dayOfWeek: new Date().getDay(),
    title: '',
    activityType: 'study',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: null,
    taskId: null,
    isRecurring: true,
    reminderEnabled: true,
    reminderMinutesBefore: 15,
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadData = useCallback(async () => {
    try {
      const [, subjectsRes, tasksRes] = await Promise.all([
        scheduleService.getWeeklySchedule(),
        subjectService.getSubjects(),
        taskService.getTasks({ completed: false }),
      ]);

      await loadWeeklySchedule();
      setSubjects(subjectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load schedule');
    }
  }, [loadWeeklySchedule]);

  useFocusRefresh(loadData, [loadData]);

  const handleCreateSchedule = async () => {
    const conflict = checkScheduleConflict(
      form.values.dayOfWeek,
      form.values.startTime,
      form.values.endTime,
      getDaySchedule(form.values.dayOfWeek)
    );

    if (conflict.hasConflict) {
      Alert.alert('Schedule Conflict', conflict.message);
      return;
    }

    try {
      await scheduleService.createSchedule(form.values);
      setModalVisible(false);
      form.reset();
      setIsEditMode(false);
      setEditingItem(null);
      loadData();
      Alert.alert('Success', 'Schedule item added');
    } catch (error) {
      Alert.alert('Error', 'Failed to create schedule item');
    }
  };

  const handleUpdateSchedule = async () => {
    const conflict = checkScheduleConflict(
      form.values.dayOfWeek,
      form.values.startTime,
      form.values.endTime,
      getDaySchedule(form.values.dayOfWeek),
      editingItem.id
    );

    if (conflict.hasConflict) {
      Alert.alert('Schedule Conflict', conflict.message);
      return;
    }

    try {
      await scheduleService.updateSchedule(editingItem.id, form.values);
      setModalVisible(false);
      form.reset();
      setIsEditMode(false);
      setEditingItem(null);
      loadData();
      Alert.alert('Success', 'Schedule item updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule item');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    Alert.alert(
      'Delete Schedule Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleService.deleteSchedule(id);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule item');
            }
          },
        },
      ]
    );
  };

  const handleEditSchedule = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsEditMode(true);
    form.setAllValues({
      dayOfWeek: item.dayOfWeek,
      title: item.title,
      activityType: item.activityType,
      startTime: item.startTime,
      endTime: item.endTime,
      subjectId: item.subjectId,
      taskId: item.taskId,
      isRecurring: item.isRecurring,
      reminderEnabled: item.reminderEnabled,
      reminderMinutesBefore: item.reminderMinutesBefore,
    });
    setModalVisible(true);
  };

  const getSubjectColor = (subjectId?: number | null) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#3498db';
  };

  const openTimePicker = (field: 'startTime' | 'endTime') => {
    setActiveTimeField(field);
    setTempTime(timeStringToDate(form.values[field]));
    setShowTimePicker(true);
  };

  const handleTimePickerChange = (event: { type?: string } | undefined, selectedDate?: Date) => {
    if (event?.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const chosenDate = selectedDate || tempTime;
    setTempTime(chosenDate);
  };

  const confirmTimePicker = () => {
    const formatted = dateToTimeString(tempTime);
    form.setAllValues({ ...form.values, [activeTimeField]: formatted });
    setShowTimePicker(false);
  };

  const cancelTimePicker = () => {
    setShowTimePicker(false);
  };

  const getDaySchedule = (dayIndex: number) => {
    return weeklySchedule[dayIndex] || [];
  };

  const renderTimeSlot = (timeSlot: ScheduleItem) => {
    const startMinutes = timeStringToDate('08:00').getHours() * 60;
    const endMinutes = timeStringToDate('22:00').getHours() * 60;
    const totalMinutes = endMinutes - startMinutes;

    const itemStart = timeStringToDate(timeSlot.startTime).getHours() * 60 + timeStringToDate(timeSlot.startTime).getMinutes();
    const itemEnd = timeStringToDate(timeSlot.endTime).getHours() * 60 + timeStringToDate(timeSlot.endTime).getMinutes();

    const top = ((itemStart - startMinutes) / totalMinutes) * 100;
    const height = ((itemEnd - itemStart) / totalMinutes) * 100;
    const backgroundColor = timeSlot.subjectId
      ? getSubjectColor(timeSlot.subjectId)
      : getActivityColor(timeSlot.activityType);
    const slotStyle = {
      top: `${top}%` as any,
      height: `${Math.max(height, 8)}%` as any,
      backgroundColor,
    };

    return (
      <TouchableOpacity
        key={timeSlot.id}
        style={[
          styles.timeSlotItem,
          {
            ...slotStyle,
          },
        ]}
        onPress={() => handleEditSchedule(timeSlot)}
        onLongPress={() => handleDeleteSchedule(timeSlot.id)}
        activeOpacity={0.8}
      >
        <View style={styles.timeSlotContent}>
          <View style={styles.timeSlotHeader}>
            <View style={styles.timeSlotIconBadge}>
              <Icon
                name={
                  timeSlot.activityType === 'class' ? 'school' :
                  timeSlot.activityType === 'study' ? 'book' :
                  timeSlot.activityType === 'break' ? 'coffee' : 'event'
                }
                size={14}
                color="#fff"
              />
            </View>
            <Text style={styles.timeSlotTitle} numberOfLines={1}>
              {timeSlot.title}
            </Text>
          </View>

          <View style={styles.timeSlotDetails}>
            <View style={styles.timeSlotTimeRow}>
              <Icon name="access-time" size={12} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.timeSlotTime}>
                {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
              </Text>
            </View>

            {timeSlot.Subject && (
              <View style={styles.timeSlotSubjectRow}>
                <Icon name="label" size={12} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.timeSlotSubject} numberOfLines={1}>
                  {timeSlot.Subject.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTimeColumn = () => {
    const times = [];
    for (let hour = 8; hour <= 22; hour++) {
      times.push(
        <View key={hour} style={[styles.timeMarker, { borderBottomColor: theme.border }]}>
          <Text style={[styles.timeMarkerText, { color: theme.textSecondary }]}>
            {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
          </Text>
        </View>
      );
    }
    return times;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Weekly Schedule</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {getDaySchedule(selectedDay).length} {getDaySchedule(selectedDay).length === 1 ? 'session' : 'sessions'} today
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: theme.background }]}
            onPress={() => setSelectedDay(new Date().getDay())}
          >
            <Icon name="today" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.daySelectorContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
        >
          {days.map((day, index) => {
            const isToday = index === new Date().getDay();
            const isSelected = selectedDay === index;
            const sessionCount = getDaySchedule(index).length;

            const currentDay = new Date().getDay();
            const dayDate = new Date(Date.now() + (index - currentDay) * 86400000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isFutureOrToday = dayDate >= today;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  isToday && !isSelected && { borderColor: theme.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <View style={styles.dayButtonContent}>
                  <Text style={[
                    styles.dayButtonTextShort,
                    { color: theme.text },
                    isSelected && { color: '#fff' },
                    isToday && !isSelected && { color: theme.primary },
                  ]}>
                    {day.substring(0, 3)}
                  </Text>
                  <Text style={[
                    styles.dayButtonDate,
                    { color: theme.textSecondary },
                    isSelected && { color: '#fff' },
                  ]}>
                    {dayDate.getDate()}
                  </Text>
                </View>
                {sessionCount > 0 && isFutureOrToday && (
                  <View style={[
                    styles.sessionCountBadge,
                    { backgroundColor: theme.warning },
                    isSelected && { backgroundColor: theme.primary }
                  ]}>
                    <Text style={[
                      styles.sessionCountText,
                      { color: '#fff' },
                      isSelected && { color: theme.text }
                    ]}>
                      {sessionCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={[styles.scheduleScrollView, { backgroundColor: theme.background }]}>
        <View style={styles.scheduleContainer}>
          <View style={[styles.timeColumn, { backgroundColor: theme.cardBackground, borderRightColor: theme.border }]}>
            {renderTimeColumn()}
          </View>

          <View style={styles.scheduleColumn}>
            <View style={[styles.timeSlotsContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              {Array.from({ length: 15 }).map((_, i) => (
                <View key={i} style={[styles.gridLine, { backgroundColor: theme.border }]} />
              ))}

              {getDaySchedule(selectedDay).length === 0 ? (
                <View style={styles.emptySchedule}>
                  <Icon name="event-available" size={64} color={theme.textTertiary} />
                  <Text style={[styles.emptyScheduleText, { color: theme.textSecondary }]}>No sessions scheduled</Text>
                  <Text style={[styles.emptyScheduleSubtext, { color: theme.textTertiary }]}>
                    Tap + to add a new session
                  </Text>
                </View>
              ) : (
                getDaySchedule(selectedDay)
                  .sort((a, b) => timeStringToDate(a.startTime).getHours() * 60 + timeStringToDate(a.startTime).getMinutes() - timeStringToDate(b.startTime).getHours() * 60 + timeStringToDate(b.startTime).getMinutes())
                  .map(renderTimeSlot)
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <FAB onPress={() => { form.reset(); setModalVisible(true); }} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          form.reset();
          setIsEditMode(false);
          setEditingItem(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {isEditMode ? 'Edit Schedule Item' : 'Add Schedule Item'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Title"
              placeholderTextColor={theme.textTertiary}
              value={form.values.title}
              onChangeText={(text) => form.handleChange('title', text)}
            />

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayOption,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      form.values.dayOfWeek === index && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => form.handleChange('dayOfWeek', index)}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        { color: theme.text },
                        form.values.dayOfWeek === index && { color: '#fff' },
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Activity Type</Text>
              <View style={styles.activityTypeContainer}>
                {['class', 'study', 'break', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.activityTypeButton,
                      { backgroundColor: getActivityColor(type) },
                      form.values.activityType === type && { opacity: 1, borderWidth: 2, borderColor: theme.primary },
                    ]}
                    onPress={() => form.handleChange('activityType', type)}
                  >
                    <Text style={[styles.activityTypeButtonText, { color: '#fff' }]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Time</Text>
              <View style={styles.timeInputContainer}>
                <TouchableOpacity
                  style={[styles.timePickerButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => openTimePicker('startTime')}
                  activeOpacity={0.85}
                >
                  <View>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Start</Text>
                    <Text style={[styles.timePickerValue, { color: theme.text }]}>{formatTime(form.values.startTime)}</Text>
                  </View>
                  <Icon name="alarm" size={18} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timePickerButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => openTimePicker('endTime')}
                  activeOpacity={0.85}
                >
                  <View>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>End</Text>
                    <Text style={[styles.timePickerValue, { color: theme.text }]}>{formatTime(form.values.endTime)}</Text>
                  </View>
                  <Icon name="schedule" size={18} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Subject (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.subjectNoneOption,
                    !form.values.subjectId && styles.selectedSubjectNoneOption,
                  ]}
                  onPress={() => form.handleChange('subjectId', null)}
                >
                  <Icon name="remove-circle-outline" size={16} color={!form.values.subjectId ? '#fff' : '#666'} style={{ marginRight: 4 }} />
                  <Text style={[
                    styles.subjectNoneOptionText,
                    !form.values.subjectId && styles.selectedSubjectNoneOptionText,
                  ]}>None</Text>
                </TouchableOpacity>
                {subjects.map(subject => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectOption,
                      form.values.subjectId === subject.id && styles.selectedSubjectOption,
                      { backgroundColor: subject.color },
                    ]}
                    onPress={() => form.handleChange('subjectId', subject.id)}
                  >
                    <Text style={styles.subjectOptionText}>{subject.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Link to Task (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.taskNoneOption,
                    !form.values.taskId && styles.selectedTaskNoneOption,
                  ]}
                  onPress={() => form.handleChange('taskId', null)}
                >
                  <Icon name="link-off" size={16} color={!form.values.taskId ? '#fff' : '#666'} style={{ marginRight: 4 }} />
                  <Text style={[
                    styles.taskNoneOptionText,
                    !form.values.taskId && styles.selectedTaskNoneOptionText,
                  ]}>None</Text>
                </TouchableOpacity>
                {tasks.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskOption,
                      form.values.taskId === task.id && styles.selectedTaskOption,
                    ]}
                    onPress={() => form.handleChange('taskId', task.id)}
                  >
                    <Icon
                      name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
                      size={14}
                      color={form.values.taskId === task.id ? '#fff' : '#4A90E2'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      styles.taskOptionText,
                      form.values.taskId === task.id && styles.selectedTaskOptionText,
                    ]} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Recurring Weekly</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  form.values.isRecurring && styles.toggleButtonActive,
                ]}
                onPress={() => form.setAllValues({ ...form.values, isRecurring: !form.values.isRecurring })}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    form.values.isRecurring && styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.reminderToggleContainer}>
                <Text style={styles.sectionLabel}>Set Reminder</Text>
                <Switch
                  value={form.values.reminderEnabled}
                  onValueChange={(value) => form.setAllValues({ ...form.values, reminderEnabled: value })}
                  trackColor={{ false: '#ccc', true: '#4A90E2' }}
                  thumbColor={'#fff'}
                />
              </View>

              {form.values.reminderEnabled && (
                <View style={styles.reminderMinutesContainer}>
                  <Text style={styles.reminderLabel}>Minutes before session:</Text>
                  <View style={styles.reminderMinutesSelector}>
                    {[5, 10, 15, 30].map((minutes) => (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.reminderMinutesOption,
                          form.values.reminderMinutesBefore === minutes && styles.selectedReminderMinutesOption,
                        ]}
                        onPress={() => form.setAllValues({ ...form.values, reminderMinutesBefore: minutes })}
                      >
                        <Text
                          style={[
                            styles.reminderMinutesText,
                            form.values.reminderMinutesBefore === minutes && styles.selectedReminderMinutesText,
                          ]}
                        >
                          {minutes}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {showTimePicker && (
              <Modal
                transparent
                animationType="fade"
                visible={showTimePicker}
                onRequestClose={cancelTimePicker}
              >
                <TouchableWithoutFeedback onPress={cancelTimePicker}>
                  <View style={styles.timePickerOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={[styles.timePickerCard, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.timePickerTitle, { color: theme.text }]}>Select time</Text>
                        <DateTimePicker
                          value={tempTime}
                          mode="time"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          is24Hour
                          onChange={handleTimePickerChange}
                          style={styles.timePickerControl}
                          textColor={Platform.OS === 'ios' ? '#000' : undefined}
                        />
                        <View style={styles.timePickerActions}>
                          <TouchableOpacity
                            style={[styles.timePickerActionButton, styles.timePickerCancelButton]}
                            onPress={cancelTimePicker}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.timePickerCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.timePickerActionButton, styles.timePickerSaveButton]}
                            onPress={confirmTimePicker}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.timePickerSaveText}>Set Time</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  form.reset();
                  setIsEditMode(false);
                  setEditingItem(null);
                }}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={isEditMode ? handleUpdateSchedule : handleCreateSchedule}
                activeOpacity={0.8}
              >
                <Icon name={isEditMode ? 'check' : 'add'} size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Update' : 'Add Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  todayButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  daySelectorContainer: { borderBottomWidth: 1 },
  daySelector: { paddingVertical: 12 },
  daySelectorContent: { paddingHorizontal: 16, gap: 10 },
  dayButton: { width: 70, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, position: 'relative' },
  dayButtonContent: { alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  selectedDayButton: { shadowColor: '#5A9FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  todayDayButton: { borderWidth: 2 },
  dayButtonTextShort: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayButtonDate: { fontSize: 16, fontWeight: 'bold' },
  todayDayButtonText: { color: '#5A9FFF' },
  selectedDayButtonText: { color: '#fff' },
  sessionCountBadge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#ff6b6b', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: '#fff', zIndex: 10 },
  sessionCountBadgeSelected: {},
  sessionCountText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  sessionCountTextSelected: { color: '#5A9FFF' },
  scheduleScrollView: { flex: 1 },
  scheduleContainer: { flexDirection: 'row', minHeight: 900 },
  timeColumn: { width: 70, borderRightWidth: 1, paddingTop: 30 },
  timeMarker: { height: 60, paddingRight: 8, paddingTop: 5, borderBottomWidth: 1 },
  timeMarkerText: { fontSize: 11, textAlign: 'right', fontWeight: '500' },
  scheduleColumn: { flex: 1, paddingHorizontal: 12, paddingTop: 30 },
  timeSlotsContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', position: 'relative', minHeight: 900, borderWidth: 1 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1 },
  timeSlotItem: { position: 'absolute', left: 8, right: 8, borderRadius: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3, borderLeftWidth: 4, borderLeftColor: 'rgba(255, 255, 255, 0.5)' },
  timeSlotContent: { flex: 1, padding: 10 },
  timeSlotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  timeSlotIconBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  timeSlotTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },
  timeSlotDetails: { gap: 4 },
  timeSlotTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeSlotTime: { color: 'rgba(255, 255, 255, 0.95)', fontSize: 12, fontWeight: '600' },
  timeSlotSubjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeSlotSubject: { flex: 1, color: 'rgba(255, 255, 255, 0.85)', fontSize: 11, fontWeight: '500' },
  emptySchedule: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyScheduleText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16, marginBottom: 8 },
  emptyScheduleSubtext: { fontSize: 14, color: '#bbb' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalContent: { borderRadius: 20, padding: 24, width: '90%', maxWidth: 400, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1a1a1a', letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: '#fafbfc' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 15, color: '#555', marginBottom: 12, fontWeight: '600', letterSpacing: 0.3 },
  dayOption: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderRadius: 12, backgroundColor: '#f5f6f8', borderWidth: 2, borderColor: '#e8e9ed' },
  selectedDayOption: { backgroundColor: '#5A9FFF', borderColor: '#5A9FFF' },
  dayOptionText: { color: '#666', fontSize: 13, fontWeight: '600' },
  selectedDayOptionText: { color: '#fff' },
  activityTypeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  activityTypeButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  selectedActivityTypeButton: { borderColor: 'rgba(255, 255, 255, 0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 6 },
  activityTypeButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  timeInputContainer: { flexDirection: 'row', gap: 12 },
  timeInput: { flex: 1 },
  timeLabel: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: '500' },
  timePickerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#fafbfc' },
  timePickerValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  timePickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  timePickerCard: { width: '100%', maxWidth: 360, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 },
  timePickerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  timePickerControl: { alignSelf: 'stretch' },
  timePickerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  timePickerActionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  timePickerCancelButton: { backgroundColor: '#f5f6f8' },
  timePickerSaveButton: { backgroundColor: '#5A9FFF' },
  timePickerCancelText: { color: '#666', fontWeight: '600', fontSize: 14 },
  timePickerSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  timeTextInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fafbfc' },
  subjectOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  subjectNoneOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, backgroundColor: '#f5f6f8', borderWidth: 2, borderColor: '#e0e0e0' },
  selectedSubjectNoneOption: { backgroundColor: '#5A9FFF', borderColor: '#5A9FFF', shadowColor: '#5A9FFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  subjectNoneOptionText: { color: '#666', fontSize: 13, fontWeight: '600' },
  selectedSubjectNoneOptionText: { color: '#fff' },
  selectedSubjectOption: { borderColor: 'rgba(255, 255, 255, 0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 6 },
  subjectOptionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  taskOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, backgroundColor: '#f5f6f8', maxWidth: 140, borderWidth: 2, borderColor: '#e0e0e0' },
  taskNoneOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, backgroundColor: '#f5f6f8', borderWidth: 2, borderColor: '#e0e0e0' },
  selectedTaskNoneOption: { backgroundColor: '#5A9FFF', borderColor: '#5A9FFF', shadowColor: '#5A9FFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  taskNoneOptionText: { color: '#666', fontSize: 13, fontWeight: '600' },
  selectedTaskNoneOptionText: { color: '#fff' },
  selectedTaskOption: { backgroundColor: '#5A9FFF', borderColor: '#5A9FFF' },
  taskOptionText: { color: '#666', fontSize: 13, fontWeight: '600' },
  selectedTaskOptionText: { color: '#fff' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  toggleLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  toggleButton: { width: 52, height: 30, borderRadius: 15, backgroundColor: '#e0e0e0', padding: 2 },
  toggleButtonActive: { backgroundColor: '#5A9FFF' },
  toggleCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', transform: [{ translateX: 0 }], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  toggleCircleActive: { transform: [{ translateX: 22 }] },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  cancelButton: { backgroundColor: '#f5f6f8' },
  cancelButtonText: { color: '#666', fontWeight: '600', fontSize: 15 },
  saveButton: { backgroundColor: '#5A9FFF', shadowColor: '#5A9FFF', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  reminderToggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reminderMinutesContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f1f3' },
  reminderLabel: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '500' },
  reminderMinutesSelector: { flexDirection: 'row', gap: 10 },
  reminderMinutesOption: { flex: 1, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, alignItems: 'center', backgroundColor: '#fafbfc' },
  selectedReminderMinutesOption: { backgroundColor: '#5A9FFF', borderColor: '#5A9FFF', shadowColor: '#5A9FFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  reminderMinutesText: { fontSize: 14, fontWeight: '600', color: '#333' },
  selectedReminderMinutesText: { color: '#fff' },
});

export default ScheduleScreen;