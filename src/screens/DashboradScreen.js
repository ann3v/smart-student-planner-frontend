import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/authContext.js';
import { taskService, scheduleService, analyticsService } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons'; 

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
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
      const [tasksRes, upcomingRes, scheduleRes, analyticsRes] = await Promise.all([
        taskService.getTodayTasks(),
        taskService.getUpcomingTasks(),
        scheduleService.getTodaySchedule(),
        analyticsService.getProductivityAnalytics(),
      ]);

      setTodayTasks(tasksRes.data);
      setUpcomingTasks(upcomingRes.data);
      setTodaySchedule(scheduleRes.data);
      
      if (analyticsRes.data.stats) {
        setStats(analyticsRes.data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Student'}!</Text>
            <Text style={styles.date}>{getDayName()}, {new Date().toLocaleDateString()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons name="settings" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Tasks')}
            >
              <MaterialIcons name="assignment" size={30} color="#4A90E2" />
              <Text style={styles.actionText}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Schedule')}
            >
              <MaterialIcons name="calendar-today" size={30} color="#4A90E2" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Subjects')}
            >
              <MaterialIcons name="menu-book" size={30} color="#4A90E2" />
              <Text style={styles.actionText}>Subjects</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <MaterialIcons name="analytics" size={30} color="#4A90E2" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {todayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for today</Text>
          ) : (
            todayTasks.slice(0, 3).map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <View style={styles.taskContent}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.Subject && (
                      <Text style={styles.taskSubject}>{task.Subject.name}</Text>
                    )}
                  </View>
                  <MaterialIcons
                    name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={task.completed ? '#27ae60' : '#ddd'}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {todaySchedule.length === 0 ? (
            <Text style={styles.emptyText}>No schedule for today</Text>
          ) : (
            todaySchedule.slice(0, 3).map(item => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{item.startTime}</Text>
                  <Text style={styles.timeText}>to</Text>
                  <Text style={styles.timeText}>{item.endTime}</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleType}>{item.activityType}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#fff' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 16, color: '#666', marginTop: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#4A90E2' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  section: { backgroundColor: '#fff', marginTop: 20, paddingHorizontal: 20, paddingVertical: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAll: { color: '#4A90E2', fontSize: 14 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionButton: { alignItems: 'center', padding: 15, flex: 1 },
  actionText: { marginTop: 8, color: '#333', fontSize: 12 },
  taskItem: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 10 },
  taskContent: { flexDirection: 'row', alignItems: 'center' },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  taskSubject: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic', paddingVertical: 20 },
  scheduleItem: { flexDirection: 'row', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 10 },
  timeContainer: { alignItems: 'center', marginRight: 15, minWidth: 60 },
  timeText: { fontSize: 12, color: '#666' },
  scheduleContent: { flex: 1 },
  scheduleTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  scheduleType: { fontSize: 12, color: '#4A90E2', marginTop: 2 },
});

export default DashboardScreen;
