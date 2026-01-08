import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { scheduleService, taskService, subjectService } from '../services/api';

const ScheduleScreen = ({ navigation }) => {
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: selectedDay,
    title: '',
    activityType: 'study',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: null,
    taskId: null,
    isRecurring: true,
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      setNewSchedule(prev => ({ ...prev, dayOfWeek: selectedDay }));
    }
  }, [selectedDay, modalVisible]);

  const loadData = async () => {
    try {
      const [scheduleRes, subjectsRes, tasksRes] = await Promise.all([
        scheduleService.getWeeklySchedule(),
        subjectService.getSubjects(),
        taskService.getTasks({ completed: false }),
      ]);
      
      setWeeklySchedule(scheduleRes.data);
      setSubjects(subjectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load schedule');
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await scheduleService.createSchedule(newSchedule);
      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert('Success', 'Schedule item added');
    } catch (error) {
      Alert.alert('Error', 'Failed to create schedule item');
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await scheduleService.updateSchedule(editingItem.id, newSchedule);
      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert('Success', 'Schedule item updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule item');
    }
  };

  const handleDeleteSchedule = async (id) => {
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

  const handleEditSchedule = (item) => {
    setEditingItem(item);
    setIsEditMode(true);
    setNewSchedule({
      dayOfWeek: item.dayOfWeek,
      title: item.title,
      activityType: item.activityType,
      startTime: item.startTime,
      endTime: item.endTime,
      subjectId: item.subjectId,
      taskId: item.taskId,
      isRecurring: item.isRecurring,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewSchedule({
      dayOfWeek: selectedDay,
      title: '',
      activityType: 'study',
      startTime: '09:00',
      endTime: '10:00',
      subjectId: null,
      taskId: null,
      isRecurring: true,
    });
    setIsEditMode(false);
    setEditingItem(null);
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#3498db';
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'class': return '#9b59b6';
      case 'study': return '#3498db';
      case 'break': return '#2ecc71';
      case 'other': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaySchedule = (dayIndex) => {
    return weeklySchedule[dayIndex] || [];
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const renderTimeSlot = (timeSlot) => {
    const startMinutes = timeToMinutes('08:00');
    const endMinutes = timeToMinutes('22:00');
    const totalMinutes = endMinutes - startMinutes;
    
    const itemStart = timeToMinutes(timeSlot.startTime);
    const itemEnd = timeToMinutes(timeSlot.endTime);
    
    const top = ((itemStart - startMinutes) / totalMinutes) * 100;
    const height = ((itemEnd - itemStart) / totalMinutes) * 100;

    return (
      <TouchableOpacity
        key={timeSlot.id}
        style={[
          styles.timeSlotItem,
          {
            top: `${top}%`,
            height: `${height}%`,
            backgroundColor: getActivityColor(timeSlot.activityType),
          },
        ]}
        onPress={() => handleEditSchedule(timeSlot)}
        onLongPress={() => handleDeleteSchedule(timeSlot.id)}
      >
        <Text style={styles.timeSlotTitle} numberOfLines={1}>
          {timeSlot.title}
        </Text>
        <Text style={styles.timeSlotTime} numberOfLines={1}>
          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
        </Text>
        {timeSlot.Subject && (
          <Text style={styles.timeSlotSubject} numberOfLines={1}>
            {timeSlot.Subject.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeColumn = () => {
    const times = [];
    for (let hour = 8; hour <= 22; hour++) {
      times.push(
        <View key={hour} style={styles.timeMarker}>
          <Text style={styles.timeMarkerText}>
            {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
          </Text>
        </View>
      );
    }
    return times;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDay === index && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === index && styles.selectedDayButtonText,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schedule Grid */}
      <View style={styles.scheduleContainer}>
        {/* Time Column */}
        <View style={styles.timeColumn}>
          {renderTimeColumn()}
        </View>

        {/* Schedule Column */}
        <View style={styles.scheduleColumn}>
          <Text style={styles.dayTitle}>{days[selectedDay]}</Text>
          
          <View style={styles.timeSlotsContainer}>
            {getDaySchedule(selectedDay)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
              .map(renderTimeSlot)}
          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Schedule Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Edit Schedule Item' : 'Add Schedule Item'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newSchedule.title}
              onChangeText={(text) => setNewSchedule({ ...newSchedule, title: text })}
            />

            {/* Day Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayOption,
                      newSchedule.dayOfWeek === index && styles.selectedDayOption,
                    ]}
                    onPress={() => setNewSchedule({ ...newSchedule, dayOfWeek: index })}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        newSchedule.dayOfWeek === index && styles.selectedDayOptionText,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Activity Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Activity Type</Text>
              <View style={styles.activityTypeContainer}>
                {['class', 'study', 'break', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.activityTypeButton,
                      newSchedule.activityType === type && styles.selectedActivityTypeButton,
                      { backgroundColor: getActivityColor(type) },
                    ]}
                    onPress={() => setNewSchedule({ ...newSchedule, activityType: type })}
                  >
                    <Text style={styles.activityTypeButtonText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Time</Text>
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={newSchedule.startTime}
                    onChangeText={(text) => setNewSchedule({ ...newSchedule, startTime: text })}
                    placeholder="HH:MM"
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>End</Text>
                  <TextInput
                    style={styles.timeTextInput}
                    value={newSchedule.endTime}
                    onChangeText={(text) => setNewSchedule({ ...newSchedule, endTime: text })}
                    placeholder="HH:MM"
                  />
                </View>
              </View>
            </View>

            {/* Subject Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Subject (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.subjectOption,
                    !newSchedule.subjectId && styles.selectedSubjectOption,
                  ]}
                  onPress={() => setNewSchedule({ ...newSchedule, subjectId: null })}
                >
                  <Text style={styles.subjectOptionText}>None</Text>
                </TouchableOpacity>
                {subjects.map(subject => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectOption,
                      newSchedule.subjectId === subject.id && styles.selectedSubjectOption,
                      { backgroundColor: subject.color },
                    ]}
                    onPress={() => setNewSchedule({ ...newSchedule, subjectId: subject.id })}
                  >
                    <Text style={styles.subjectOptionText}>{subject.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Task Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Link to Task (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.taskOption,
                    !newSchedule.taskId && styles.selectedTaskOption,
                  ]}
                  onPress={() => setNewSchedule({ ...newSchedule, taskId: null })}
                >
                  <Text style={styles.taskOptionText}>None</Text>
                </TouchableOpacity>
                {tasks.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskOption,
                      newSchedule.taskId === task.id && styles.selectedTaskOption,
                    ]}
                    onPress={() => setNewSchedule({ ...newSchedule, taskId: task.id })}
                  >
                    <Text style={styles.taskOptionText} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recurring Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Recurring Weekly</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  newSchedule.isRecurring && styles.toggleButtonActive,
                ]}
                onPress={() => setNewSchedule({ ...newSchedule, isRecurring: !newSchedule.isRecurring })}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    newSchedule.isRecurring && styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={isEditMode ? handleUpdateSchedule : handleCreateSchedule}
              >
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Update' : 'Add'}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  daySelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedDayButton: {
    backgroundColor: '#4A90E2',
  },
  dayButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  scheduleContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  timeColumn: {
    width: 80,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  timeMarker: {
    height: 60,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeMarkerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  scheduleColumn: {
    flex: 1,
    padding: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  timeSlotsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 840, // 14 hours * 60px
  },
  timeSlotItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeSlotTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  timeSlotTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    marginBottom: 2,
  },
  timeSlotSubject: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  dayOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedDayOption: {
    backgroundColor: '#4A90E2',
  },
  dayOptionText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedDayOptionText: {
    color: '#fff',
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedActivityTypeButton: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  activityTypeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  subjectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
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
    fontSize: 12,
    fontWeight: '500',
  },
  taskOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    maxWidth: 120,
  },
  selectedTaskOption: {
    backgroundColor: '#4A90E2',
  },
  taskOptionText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTaskOptionText: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ddd',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;