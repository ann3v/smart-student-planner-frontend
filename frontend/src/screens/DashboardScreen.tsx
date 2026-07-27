import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusRefresh } from '../hooks/useFocusRefresh';
import { useAnalytics } from '../hooks/useAnalytics';
import { taskService, scheduleService } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { StatCard, SectionHeader, EmptyState } from '../components';
import { getPriorityColor, DAYS_OF_WEEK } from '../utils/constants';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { analytics, loadAnalytics } = useAnalytics();
  const [refreshing, setRefreshing] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, scheduleRes] = await Promise.all([
        taskService.getTodayTasks(),
        scheduleService.getTodaySchedule(),
      ]);

      setTodayTasks(tasksRes.data);
      setTodaySchedule(scheduleRes.data);
      loadAnalytics();
    } catch (error) {
      // Error handled silently — UI shows empty states
    }
  }, [loadAnalytics]);

  // Single hook replaces both useEffect([]) and useFocusEffect — no duplicate calls
  useFocusRefresh(loadData, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDayName = () => {
    return DAYS_OF_WEEK[new Date().getDay()];
  };

  const stats = analytics?.stats || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ backgroundColor: theme.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.name || 'Student'}!</Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{getDayName()}, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons name="settings" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard value={stats.totalTasks} label="Total Tasks" valueColor={theme.primary} />
          <StatCard value={stats.completedTasks} label="Completed" valueColor={theme.success} />
          <StatCard value={stats.pendingTasks} label="Pending" valueColor={theme.warning} />
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background }]}
              onPress={() => navigation.navigate('Tasks')}
            >
              <MaterialIcons name="assignment" size={30} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background }]}
              onPress={() => navigation.navigate('Schedule')}
            >
              <MaterialIcons name="calendar-today" size={30} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background }]}
              onPress={() => navigation.navigate('Subjects')}
            >
              <MaterialIcons name="menu-book" size={30} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Subjects</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.background }]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <MaterialIcons name="analytics" size={30} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <SectionHeader
            title="Today's Tasks"
            actionLabel="See All"
            onAction={() => navigation.navigate('Tasks')}
          />
          
          {todayTasks.length === 0 ? (
            <EmptyState
              icon="assignment"
              title="No tasks for today"
              subtitle="Tap + to create your first task"
            />
          ) : (
            todayTasks.slice(0, 3).map(task => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <View style={styles.taskContent}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
                    {task.Subject && (
                      <Text style={[styles.taskSubject, { color: theme.textSecondary }]}>{task.Subject.name}</Text>
                    )}
                  </View>
                  <MaterialIcons
                    name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={task.completed ? theme.success : theme.textTertiary}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Today's Schedule */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <SectionHeader
            title="Today's Schedule"
            actionLabel="See All"
            onAction={() => navigation.navigate('Schedule')}
          />
          
          {todaySchedule.length === 0 ? (
            <EmptyState
              icon="calendar-today"
              title="No schedule for today"
              subtitle="Add your classes and study sessions"
            />
          ) : (
            todaySchedule.slice(0, 3).map(item => (
              <View key={item.id} style={[styles.scheduleItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: theme.primary }]}>{item.startTime}</Text>
                  <Text style={[styles.timeText, { color: theme.textTertiary }]}>to</Text>
                  <Text style={[styles.timeText, { color: theme.primary }]}>{item.endTime}</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={[styles.scheduleTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.scheduleType, { color: theme.textSecondary }]}>{item.activityType}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    borderBottomWidth: 1,
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: 'bold', 
  },
  date: { 
    fontSize: 16, 
    marginTop: 5 
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginTop: 10 
  },
  section: { 
    marginTop: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
  },
  actionsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  actionButton: { 
    alignItems: 'center', 
    padding: 15, 
    flex: 1,
    borderRadius: 12,
  },
  actionText: { 
    marginTop: 8, 
    fontSize: 12 
  },
  taskItem: { 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    borderWidth: 1,
  },
  taskContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  priorityDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 10 
  },
  taskInfo: { 
    flex: 1 
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  taskSubject: { 
    fontSize: 12, 
    marginTop: 2 
  },
  scheduleItem: { 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    borderWidth: 1,
  },
  timeContainer: { 
    alignItems: 'center', 
    marginRight: 15, 
    minWidth: 60 
  },
  timeText: { 
    fontSize: 12, 
  },
  scheduleContent: { 
    flex: 1 
  },
  scheduleTitle: { 
    fontSize: 16, 
    fontWeight: '500', 
  },
  scheduleType: { 
    fontSize: 12, 
    marginTop: 2 
  },
});

export default DashboardScreen;