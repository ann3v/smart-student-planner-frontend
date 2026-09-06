import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { taskService } from '../services/api';
import { formatDate, parseDate } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { useFocusRefresh } from '../hooks/useFocusRefresh';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { useNotifications } from '../hooks/useNotifications';
import { FAB, FilterChips, TaskCard, EmptyState } from '../components';
import { TASK_FILTERS } from '../utils/constants';
import type { Task, TaskCreateInput, TaskPriority } from '../types';

interface TasksScreenProps {
  navigation: {
    navigate: (screen: string, params?: { taskId?: number }) => void;
  };
}

const TasksScreen = ({ navigation }: TasksScreenProps) => {
  const { theme } = useTheme();
  const { tasks, loadTasks } = useTasks();
  const { loadSubjects } = useSubjects();
  const { reminders } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTask, setNewTask] = useState<TaskCreateInput & { dueDate: string | null }>({
    title: '',
    description: '',
    subjectId: null,
    priority: 'medium',
    dueDate: null,
  });

  const loadFilteredTasks = useCallback(() => {
    loadTasks(filter === 'all' ? undefined : { completed: filter === 'completed' });
  }, [filter, loadTasks]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useFocusRefresh(loadFilteredTasks, [loadFilteredTasks]);

  const taskReminders = useMemo(() => {
    const map: Record<number, unknown[]> = {};
    reminders.forEach(reminder => {
      if (reminder.taskId) {
        if (!map[reminder.taskId]) {
          map[reminder.taskId] = [];
        }
        map[reminder.taskId].push(reminder);
      }
    });
    return map;
  }, [reminders]);

  const handleToggleCompletion = useCallback(async (taskId: number) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      loadFilteredTasks();
    } catch {
      Alert.alert('Error', 'Failed to update task');
    }
  }, [loadFilteredTasks]);

  const handleDateChange = useCallback((event: { type?: string } | undefined, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setNewTask(prev => ({...prev, dueDate: selectedDate.toISOString()}));
    }
    if (Platform.OS === 'ios' && event?.type === 'set') {
      setShowDatePicker(false);
    }
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await taskService.createTask(newTask);

      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        subjectId: null,
        priority: 'medium',
        dueDate: null,
      });
      Keyboard.dismiss();
      loadFilteredTasks();
    } catch (error) {
      Alert.alert('Error', (error as any).response?.data?.error || 'Failed to create task');
    }
  }, [newTask, loadFilteredTasks]);

  const renderTaskItem = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onToggleComplete={() => handleToggleCompletion(item.id)}
      reminderCount={taskReminders[item.id]?.length || 0}
    />
  ), [navigation, handleToggleCompletion, taskReminders]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter Chips */}
      <FilterChips
        options={TASK_FILTERS}
        activeOption={filter}
        onSelect={setFilter}
      />

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={useCallback((item: Task) => item.id.toString(), [])}
        contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }]}
        style={{ backgroundColor: theme.background }}
        windowSize={5}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        removeClippedSubviews={true}
        ListEmptyComponent={useMemo(() => (
          <EmptyState
            icon="assignment"
            title="No tasks found"
            subtitle="Tap + to create your first task"
          />
        ), [])}
      />

      {/* Add Task Button */}
      <FAB onPress={() => setModalVisible(true)} />

      {/* Create Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                  }}>
                    <Icon name="close" size={28} color={theme.text} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Task</Text>
                  <View style={{ width: 28 }} />
                </View>
                
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Task Title *"
                  placeholderTextColor={theme.textTertiary}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({...newTask, title: text})}
                  editable={true}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={theme.textTertiary}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({...newTask, description: text})}
                  multiline
                  numberOfLines={3}
                />
                
                {/* Due Date Selector */}
                <View style={styles.dueDateContainer}>
                  <Text style={[styles.label, { color: theme.text }]}>Due Date</Text>
                  
                  {/* Quick Date Buttons */}
                  <View style={styles.quickDateButtons}>
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.background, borderColor: theme.border }, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date().toDateString() && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setNewTask({...newTask, dueDate: new Date().toISOString()})}
                    >
                      <Text style={[styles.quickDateButtonText, { color: theme.text }, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date().toDateString() && { color: '#fff' }]}>
                        Today
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.background, borderColor: theme.border }, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date(Date.now() + 86400000).toDateString() && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setNewTask({...newTask, dueDate: tomorrow.toISOString()});
                      }}
                    >
                      <Text style={[styles.quickDateButtonText, { color: theme.text }, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date(Date.now() + 86400000).toDateString() && { color: '#fff' }]}>
                        Tomorrow
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Icon name="calendar-today" size={16} color={theme.primary} />
                      <Text style={[styles.quickDateButtonText, { color: theme.text }]}>Pick Date</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.dueDateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Icon name="calendar-today" size={20} color={theme.primary} />
                    <Text style={[styles.dueDateButtonText, { color: theme.text }]}>
                      {newTask.dueDate 
                        ? formatDate(newTask.dueDate)
                        : 'Select a date (optional)'
                      }
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={newTask.dueDate ? parseDate(newTask.dueDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      textColor={theme.text}
                    />
                  )}
                </View>
                
                {/* Priority Selector */}
                <View style={styles.priorityContainer}>
                  <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
                  <View style={styles.priorityOptions}>
                    {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityButton,
                          { backgroundColor: theme.background, borderColor: theme.border },
                          newTask.priority === p && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setNewTask({...newTask, priority: p})}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          { color: theme.text },
                          newTask.priority === p && { color: '#fff' }
                        ]}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.createButton, { backgroundColor: theme.primary }]}
                    onPress={handleCreateTask}
                  >
                    <Text style={styles.createButtonText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  checkbox: {
    marginRight: 15,
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  subjectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  priorityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dueDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  addButton: {
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: '#5A9FFF',
    backgroundColor: '#5A9FFF',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textTransform: 'capitalize',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  dueDateContainer: {
    marginBottom: 20,
  },
  dueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dueDateButtonText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  quickDateButtonActive: {
    backgroundColor: '#5A9FFF',
    borderColor: '#5A9FFF',
  },
  quickDateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  quickDateButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#5A9FFF',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A9FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reminderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TasksScreen;