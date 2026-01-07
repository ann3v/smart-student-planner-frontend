import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { taskService, subjectService } from '../services/api';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subjectId: null,
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    loadTasks();
    loadSubjects();
  }, [filter]);

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

  const handleToggleCompletion = async (taskId) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      loadTasks(); // Reload tasks
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleCreateTask = async () => {
    try {
      await taskService.createTask(newTask);
      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        subjectId: null,
        priority: 'medium',
        dueDate: '',
      });
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleCompletion(item.id)}
      >
        <Icon
          name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.completed ? '#27ae60' : '#ddd'}
        />
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
          {item.title}
        </Text>
        
        {item.description ? (
          <Text style={styles.taskDescription} numberOfLines={2}>
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
            <Text style={styles.dueDate}>
              {new Date(item.dueDate).toLocaleDateString()}
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
    <SafeAreaView style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'completed'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
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
            <Icon name="assignment" size={50} color="#ddd" />
            <Text style={styles.emptyText}>No tasks found</Text>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({...newTask, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newTask.description}
              onChangeText={(text) => setNewTask({...newTask, description: text})}
              multiline
              numberOfLines={3}
            />
            
            {/* Add more inputs for subject, priority, due date */}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
  },
  createButton: {
    backgroundColor: '#4A90E2',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TasksScreen;