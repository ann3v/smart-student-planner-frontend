import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { taskService, subjectService } from '../services/api';
import notificationService from '../services/notificationService';
import { formatDate, formatDateShort, parseDate } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

const TasksScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskReminders, setTaskReminders] = useState({});
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subjectId: null,
    priority: 'medium',
    dueDate: null,
  });

  useEffect(() => {
    loadTasks();
    loadSubjects();
    loadTaskReminders();
  }, [filter]);

  // Refresh tasks when screen comes into focus (e.g., after deleting a task)
  useFocusEffect(
    useCallback(() => {
      loadTasks();
      loadTaskReminders();
    }, [filter])
  );

  const loadTasks = async () => {
    try {
      const params = {};
      if (filter === 'pending') params.completed = false;
      if (filter === 'completed') params.completed = true;
      
      const response = await taskService.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
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
      const allReminders = await notificationService.getStoredNotifications();
      const reminderMap = {};
      allReminders.forEach(reminder => {
        if (reminder.taskId) {
          if (!reminderMap[reminder.taskId]) {
            reminderMap[reminder.taskId] = [];
          }
          reminderMap[reminder.taskId].push(reminder);
        }
      });
      setTaskReminders(reminderMap);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const handleToggleCompletion = async (taskId) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      loadTasks(); // Reload tasks
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Convert to ISO string for consistent storage
      setNewTask({...newTask, dueDate: selectedDate.toISOString()});
    }
    if (Platform.OS === 'ios' && event.type === 'set') {
      setShowDatePicker(false);
    }
  };

  const handleCreateTask = async () => {
    // Validation
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      console.log('Creating task with data:', JSON.stringify(newTask, null, 2));
      console.log('Task fields:', {
        title: newTask.title,
        description: newTask.description,
        subjectId: newTask.subjectId,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
      });
      
      const response = await taskService.createTask(newTask);
      console.log('Task created successfully:', response.data);
      
      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        subjectId: null,
        priority: 'medium',
        dueDate: null,
      });
      Keyboard.dismiss();
      loadTasks();
      loadTaskReminders();
    } catch (error) {
      console.error('Failed to create task:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.response?.data?.error || 'Failed to create task');
    }
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleCompletion(item.id)}
      >
        <Icon
          name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.completed ? '#27ae60' : theme.textTertiary}
        />
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <View style={styles.taskTitleContainer}>
          <Text style={[styles.taskTitle, { color: theme.text }, item.completed && styles.completedTask]}>
            {item.title}
          </Text>
          {taskReminders[item.id] && taskReminders[item.id].length > 0 && (
            <View style={styles.reminderBadge}>
              <Icon name="notifications-active" size={14} color="#fff" />
              <Text style={styles.reminderBadgeText}>{taskReminders[item.id].length}</Text>
            </View>
          )}
        </View>
        
        {item.description ? (
          <Text style={[styles.taskDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.taskMeta}>
          {item.Subject && (
            <View style={[styles.subjectTag, { backgroundColor: item.Subject.color || '#3498db' }]}>
              <Text style={styles.subjectText}>{item.Subject.name}</Text>
            </View>
          )}
          
          <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
          
          {item.dueDate && (
            <Text style={[styles.dueDate, { color: theme.textSecondary }]}>
              {formatDateShort(item.dueDate)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'completed'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton, 
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
              filter === filterType && { backgroundColor: theme.primary }
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterText, 
              { color: theme.text },
              filter === filterType && { color: '#fff' }
            ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={50} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found</Text>
          </View>
        }
      />

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

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
                      style={[styles.quickDateButton, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date().toDateString() && styles.quickDateButtonActive]}
                      onPress={() => setNewTask({...newTask, dueDate: new Date().toISOString()})}
                    >
                      <Text style={[styles.quickDateButtonText, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date().toDateString() && styles.quickDateButtonTextActive]}>
                        Today
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.quickDateButton, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date(Date.now() + 86400000).toDateString() && styles.quickDateButtonActive]}
                      onPress={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setNewTask({...newTask, dueDate: tomorrow.toISOString()});
                      }}
                    >
                      <Text style={[styles.quickDateButtonText, newTask.dueDate && new Date(newTask.dueDate).toDateString() === new Date(Date.now() + 86400000).toDateString() && styles.quickDateButtonTextActive]}>
                        Tomorrow
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Icon name="calendar-today" size={16} color="#4A90E2" />
                      <Text style={styles.quickDateButtonText}>Pick Date</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.dueDateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Icon name="calendar-today" size={20} color="#4A90E2" />
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
                    {['low', 'medium', 'high'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityButton,
                          { backgroundColor: theme.background, borderColor: theme.border },
                          newTask.priority === p && styles.priorityButtonActive
                        ]}
                        onPress={() => setNewTask({...newTask, priority: p})}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          { color: theme.text },
                          newTask.priority === p && styles.priorityButtonTextActive
                        ]}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.createButton]}
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
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    color: '#333',
    marginBottom: 5,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    color: '#666',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
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
    color: '#333',
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
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
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
    color: '#333',
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
    backgroundColor: '#4A90E2',
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
    backgroundColor: '#4A90E2',
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