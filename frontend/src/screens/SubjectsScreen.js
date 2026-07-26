import React, { useState, useCallback } from 'react';
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
import { taskService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useFocusRefresh } from '../hooks/useFocusRefresh';
import { useSubjects } from '../hooks/useSubjects';
import { useForm } from '../hooks/useForm';
import { FAB, SubjectCard, EmptyState, ColorPicker } from '../components';

const SubjectsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { subjects, loadSubjects } = useSubjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const form = useForm({ name: '', color: '#3498db' });

  // Refresh subjects when screen comes into focus — no duplicate calls
  useFocusRefresh(loadSubjects, [loadSubjects]);

  const handleCreateSubject = async () => {
    if (!form.values.name.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      await subjectService.createSubject(form.values);
      setModalVisible(false);
      form.reset();
      setIsEditMode(false);
      setEditingSubject(null);
      loadSubjects();
      Alert.alert('Success', 'Subject created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async () => {
    if (!form.values.name.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      await subjectService.updateSubject(editingSubject.id, form.values);
      setModalVisible(false);
      form.reset();
      setIsEditMode(false);
      setEditingSubject(null);
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
    form.setAllValues({
      name: subject.name,
      color: subject.color,
    });
    setModalVisible(true);
  };

  const renderSubjectItem = ({ item }) => {
    return (
      <SubjectCard
        subject={item}
        onPress={() => navigation.navigate('Tasks', { subjectId: item.id })}
        onEdit={() => handleEditSubject(item)}
        onDelete={() => handleDeleteSubject(item)}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Subjects</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage your academic subjects</Text>
      </View>

      {/* Subject List */}
      <FlatList
        data={subjects}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item.id.toString()}
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }]}
        ListEmptyComponent={
          <EmptyState
            icon="menu-book"
            title="No Subjects Yet"
            subtitle="Add your first subject to get started"
          />
        }
      />

      {/* Add Button */}
      <FAB onPress={() => { form.reset(); setModalVisible(true); }} />

      {/* Subject Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          form.reset();
          setIsEditMode(false);
          setEditingSubject(null);
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {isEditMode ? 'Edit Subject' : 'New Subject'}
            </Text>

            {/* Subject Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Subject Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g., Mathematics, Physics"
                placeholderTextColor={theme.textTertiary}
                value={form.values.name}
                onChangeText={(text) => form.handleChange('name', text)}
                autoFocus
              />
            </View>

            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Color</Text>
              <ColorPicker selectedColor={form.values.color} onColorSelect={(color) => form.handleChange('color', color)} />
            </View>

            {/* Color Preview */}
            <View style={styles.colorPreviewContainer}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>Preview:</Text>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: form.values.color },
                ]}
              >
                <Text style={styles.colorPreviewText}>{form.values.name || 'Subject Name'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => {
                  setModalVisible(false);
                  form.reset();
                  setIsEditMode(false);
                  setEditingSubject(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primary }]}
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  subjectCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
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
  },
  completedCount: {
    color: '#27ae60',
  },
  pendingCount: {
    color: '#e74c3c',
  },
  taskCountLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  taskCountDivider: {
    width: 1,
    height: 20,
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
    backgroundColor: '#5A9FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A9FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 15,
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
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
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
    backgroundColor: '#5A9FFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubjectsScreen;