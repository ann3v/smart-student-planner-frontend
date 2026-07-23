import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PriorityBadge, SubjectBadge } from './index';
import { formatDateShort } from '../utils/dateUtils';

const TaskCard = ({ task, onPress, onToggleComplete, reminderCount, style }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.taskItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <TouchableOpacity style={styles.checkbox} onPress={onToggleComplete}>
        <MaterialIcons
          name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={task.completed ? '#27ae60' : theme.textTertiary}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <View style={styles.taskTitleContainer}>
          <Text style={[styles.taskTitle, { color: theme.text }, task.completed && styles.completedTask]}>
            {task.title}
          </Text>
          {reminderCount > 0 && (
            <View style={styles.reminderBadge}>
              <MaterialIcons name="notifications-active" size={14} color="#fff" />
              <Text style={styles.reminderBadgeText}>{reminderCount}</Text>
            </View>
          )}
        </View>

        {task.description ? (
          <Text style={[styles.taskDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.taskMeta}>
          {task.Subject && (
            <SubjectBadge name={task.Subject.name} color={task.Subject.color} />
          )}
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <Text style={[styles.dueDate, { color: theme.textSecondary }]}>
              {formatDateShort(task.dueDate)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
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
  dueDate: {
    fontSize: 12,
    marginBottom: 4,
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

export default TaskCard;