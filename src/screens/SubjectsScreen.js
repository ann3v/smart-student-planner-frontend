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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { subjectService, taskService } from '../services/api';

const SubjectsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [tasksBySubject, setTasksBySubject] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    color: '#3498db',
  });

  const colorPalette = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#d35400', // Dark Orange
    '#c0392b', // Dark Red
    '#27ae60', // Dark Green
    '#8e44ad', // Dark Purple
    '#16a085', // Dark Teal
    '#7f8c8d', // Gray
  ];

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getSubjects();
      const subjectsData = response.data;
      setSubjects(subjectsData);
      
      // Load tasks for each subject
      const tasksMap = {};
      for (const subject of subjectsData) {
        const tasksRes = await taskService.getTasks({ subjectId: subject.id });
        tasksMap[subject.id] = tasksRes.data;
      }
      setTasksBySubject(tasksMap);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      Alert.alert('Error', 'Failed to load subjects');
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.name.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      await subjectService.createSubject(newSubject);
      setModalVisible(false);
      resetForm();
      loadSubjects();
      Alert.alert('Success', 'Subject created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async () => {
    if (!newSubject.name.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      await subjectService.updateSubject(editingSubject.id, newSubject);
      setModalVisible(false);
      resetForm();
      loadSubjects();
      Alert.alert('Success', 'Subject updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update subject');
    }
  };

  const handleDeleteSubject = (subject) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${subject.name}"? This will also delete all associated tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await subjectService.deleteSubject(subject.id);
              loadSubjects();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete subject');
            }
          },
        },
      ]
    );
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsEditMode(true);
    setNewSubject({
      name: subject.name,
      color: subject.color,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewSubject({
      name: '',
      color: '#3498db',
    });
    setIsEditMode(false);
    setEditingSubject(null);
  };

  const getTaskCount = (subjectId) => {
    const tasks = tasksBySubject[subjectId] || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const renderSubjectItem = ({ item }) => {
    const taskCounts = getTaskCount(item.id);
    
    return (
      <TouchableOpacity
        style={styles.subjectCard}
        onPress={() => navigation.navigate('Tasks', { subjectId: item.id })}
        onLongPress={() => handleEditSubject(item)}
      >
        {/* Color Indicator */}
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />

        {/* Subject Info */}
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          
          {/* Task Counts */}
          <View style={styles.taskCounts}>
            <View style={styles.taskCountItem}>
              <Text style={styles.taskCountNumber}>{taskCounts.total}</Text>
              <Text style={styles.taskCountLabel}>Total</Text>
            </View>
            
            <View style={styles.taskCountDivider} />
            
            <View style={styles.taskCountItem}>
              <Text style={[styles.taskCountNumber, styles.completedCount]}>
                {taskCounts.completed}
              </Text>
              <Text style={styles.taskCountLabel}>Done</Text>
            </View>
            
            <View style={styles.taskCountDivider} />
            
            <View style={styles.taskCountItem}>
              <Text style={[styles.taskCountNumber, styles.pendingCount]}>
                {taskCounts.pending}
              </Text>
              <Text style={styles.taskCountLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.subjectActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditSubject(item)}
          >
            <Icon name="edit" size={20} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteSubject(item)}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Subjects</Text>
        <Text style={styles.subtitle}>Manage your academic subjects</Text>
      </View>

      {/* Subject List */}
      <FlatList
        data={subjects}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="menu-book" size={60} color="#ddd" />
            <Text style={styles.emptyTitle}>No Subjects Yet</Text>
            <Text style={styles.emptyText}>
              Add your first subject to get started
            </Text>
          </View>
        }
      />

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

      {/* Subject Modal */}
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
              {isEditMode ? 'Edit Subject' : 'New Subject'}
            </Text>

            {/* Subject Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mathematics, Physics"
                value={newSubject.name}
                onChangeText={(text) => setNewSubject({ ...newSubject, name: text })}
                autoFocus
              />
            </View>

            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newSubject.color === color && styles.selectedColorOption,
                    ]}
                    onPress={() => setNewSubject({ ...newSubject, color })}
                  >
                    {newSubject.color === color && (
                      <Icon name="check" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Preview */}
            <View style={styles.colorPreviewContainer}>
              <Text style={styles.previewLabel}>Preview:</Text>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: newSubject.color },
                ]}
              >
                <Text style={styles.colorPreviewText}>{newSubject.name || 'Subject Name'}</Text>
              </View>
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
                onPress={isEditMode ? handleUpdateSubject : handleCreateSubject}
              >
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Update' : 'Create'}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  subjectCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  colorIndicator: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  taskCounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCountItem: {
    alignItems: 'center',
    minWidth: 40,
  },
  taskCountNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  completedCount: {
    color: '#27ae60',
  },
  pendingCount: {
    color: '#e74c3c',
  },
  taskCountLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  taskCountDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  subjectActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  colorPreviewContainer: {
    marginBottom: 25,
  },
  previewLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  colorPreview: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  colorPreviewText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubjectsScreen;