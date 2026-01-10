import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { taskService, scheduleService, analyticsService } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons'; 

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const loadData = async () => {
    try {
      console.log('Calling: /tasks/today');
      console.log('Calling: /tasks/upcoming');
      console.log('Calling: /schedule/today');
      console.log('Calling: /analytics/productivity');
      
      const [tasksRes, upcomingRes, scheduleRes, analyticsRes] = await Promise.all([
        taskService.getTodayTasks(),
        taskService.getUpcomingTasks(),
        scheduleService.getTodaySchedule(),
        analyticsService.getProductivityAnalytics(),
      ]);

      console.log('✅ /tasks/today Response:', tasksRes.data);
      console.log('✅ /tasks/upcoming Response:', upcomingRes.data);
      console.log('✅ /schedule/today Response:', scheduleRes.data);
      console.log('✅ /analytics/productivity Response:', analyticsRes.data);
      
      // Verify analytics structure
      console.log('Analytics Structure Check:');
      console.log('- tasksPerDay:', analyticsRes.data.tasksPerDay);
      console.log('- completionRate:', analyticsRes.data.completionRate, '(should be a number, not NaN)');
      console.log('- tasksByPriority:', analyticsRes.data.tasksByPriority);
      console.log('- tasksBySubject:', analyticsRes.data.tasksBySubject);
      console.log('- studyHoursPerDay:', analyticsRes.data.studyHoursPerDay);
      console.log('- stats:', analyticsRes.data.stats);

      setTodayTasks(tasksRes.data);
      setUpcomingTasks(upcomingRes.data);
      setTodaySchedule(scheduleRes.data);
      
      if (analyticsRes.data.stats) {
        setStats(analyticsRes.data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Data:', error.response?.data);
      console.error('Error Message:', error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

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
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalTasks}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Tasks</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.success }]}>{stats.completedTasks}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.warning }]}>{stats.pendingTasks}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {todayTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks for today</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {todaySchedule.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No schedule for today</Text>
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
  statCard: { 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    flex: 1, 
    marginHorizontal: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 2,
    borderWidth: 1,
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: 'bold', 
  },
  statLabel: { 
    fontSize: 12, 
    marginTop: 5 
  },
  section: { 
    marginTop: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
  },
  seeAll: { 
    fontSize: 14 
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
  emptyText: { 
    textAlign: 'center', 
    fontStyle: 'italic', 
    paddingVertical: 20 
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
