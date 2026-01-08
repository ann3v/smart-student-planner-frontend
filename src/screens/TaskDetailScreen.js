import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { taskService, subjectService } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadTask();
    loadSubjects();
  }, []);

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
      loadTask();
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={20} color="#4A90E2" />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteTask}>
              <Icon name="delete" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Task Title */}
        <View style={styles.section}>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editedTask.title}
              onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
              placeholder="Task title"
            />
          ) : (
            <Text style={styles.title}>{task.title}</Text>
          )}
          
          <TouchableOpacity
            style={[styles.completionButton, task.completed && styles.completedButton]}
            onPress={handleToggleCompletion}
          >
            <Icon
              name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
              size={20}
              color={task.completed ? '#27ae60' : '#ddd'}
            />
            <Text style={[styles.completionText, task.completed && styles.completedText]}>
              {task.completed ? 'Completed' : 'Mark as complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Details */}
        <View style={styles.detailsContainer}>
          {/* Description */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Description</Text>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={editedTask.description || ''}
                onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                placeholder="Add description..."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.detailValue}>
                {task.description || 'No description added'}
              </Text>
            )}
          </View>

          {/* Subject */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Subject</Text>
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
            <Text style={styles.detailLabel}>Priority</Text>
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
            <Text style={styles.detailLabel}>Due Date & Time</Text>
            {isEditing ? (
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#4A90E2" />
                  <Text style={styles.dateTimeButtonText}>
                    {editedTask.dueDate ? formatDate(editedTask.dueDate) : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="access-time" size={20} color="#4A90E2" />
                  <Text style={styles.dateTimeButtonText}>
                    {editedTask.dueDate ? formatTime(editedTask.dueDate) : 'Select Time'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editedTask.dueDate ? new Date(editedTask.dueDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={editedTask.dueDate ? new Date(editedTask.dueDate) : new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            ) : (
              <View style={styles.dateTimeDisplay}>
                <Icon name="calendar-today" size={20} color="#4A90E2" />
                <Text style={styles.dateTimeText}>
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                </Text>
                {task.dueDate && (
                  <>
                    <Icon name="access-time" size={20} color="#4A90E2" style={styles.timeIcon} />
                    <Text style={styles.dateTimeText}>{formatTime(task.dueDate)}</Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Created Date */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Estimated Duration */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Estimated Duration</Text>
            {isEditing ? (
              <View style={styles.durationSelector}>
                {[30, 60, 90, 120].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.durationOption,
                      editedTask.estimatedDuration === minutes && styles.selectedDurationOption
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, estimatedDuration: minutes })}
                  >
                    <Text style={styles.durationOptionText}>{minutes} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.detailValue}>
                {task.estimatedDuration ? `${task.estimatedDuration} minutes` : 'Not specified'}
              </Text>
            )}
          </View>
        </View>

        {/* Save Button (when editing) */}
        {isEditing && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={styles.saveButton}
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    color: '#4A90E2',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completedButton: {
    backgroundColor: '#e8f6ef',
  },
  completionText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
  },
  completedText: {
    color: '#27ae60',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  detailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
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
    color: '#333',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
});

export default TaskDetailScreen;