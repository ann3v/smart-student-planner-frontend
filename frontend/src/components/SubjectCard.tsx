import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  taskCounts?: {
    total?: number;
    completed?: number;
    pending?: number;
  };
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Card component for displaying a subject with task counts and edit/delete actions.
 *
 * @param {object} props
 * @param {object} props.subject - The subject object ({ id, name, color })
 * @param {{ total: number, completed: number, pending: number }} props.taskCounts - Task counts for the subject
 * @param {() => void} props.onPress - Called when the card is pressed
 * @param {() => void} props.onEdit - Called when the edit button is pressed
 * @param {() => void} props.onDelete - Called when the delete button is pressed
 */
const SubjectCard = ({ subject, taskCounts, onPress, onEdit, onDelete, style }: SubjectCardProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Color indicator */}
      <View style={[styles.colorIndicator, { backgroundColor: subject.color }]} />

      {/* Subject info */}
      <View style={styles.subjectInfo}>
        <Text style={[styles.subjectName, { color: theme.text }]} numberOfLines={1}>
          {subject.name}
        </Text>

        <View style={styles.taskCounts}>
          <View style={styles.taskCountItem}>
            <Text style={[styles.taskCountNumber, { color: theme.text }]}>
              {taskCounts?.total ?? 0}
            </Text>
            <Text style={[styles.taskCountLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.taskCountDivider, { backgroundColor: theme.border }]} />

          <View style={styles.taskCountItem}>
            <Text style={[styles.taskCountNumber, styles.completedCount]}>
              {taskCounts?.completed ?? 0}
            </Text>
            <Text style={[styles.taskCountLabel, { color: theme.textSecondary }]}>Done</Text>
          </View>

          <View style={[styles.taskCountDivider, { backgroundColor: theme.border }]} />

          <View style={styles.taskCountItem}>
            <Text style={[styles.taskCountNumber, styles.pendingCount]}>
              {taskCounts?.pending ?? 0}
            </Text>
            <Text style={[styles.taskCountLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.subjectActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
          onPress={onEdit}
        >
          <MaterialIcons name="edit" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.danger + '20' }]}
          onPress={onDelete}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default SubjectCard;