import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  LineChart,
  PieChart,
  BarChart,
} from 'react-native-chart-kit';
import { analyticsService } from '../services/api';
import moment from 'moment';
import { formatDateShort } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

const AnalyticsScreen = () => {
  const { theme, isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [workload, setWorkload] = useState({});
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Refresh analytics when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [timeRange])
  );

  const loadAnalytics = async () => {
    try {
      let startDate, endDate;
      const today = new Date();

      switch (timeRange) {
        case 'week':
          startDate = moment().subtract(7, 'days').toDate();
          endDate = today;
          break;
        case 'month':
          startDate = moment().subtract(30, 'days').toDate();
          endDate = today;
          break;
        case 'semester':
          startDate = moment().subtract(90, 'days').toDate();
          endDate = today;
          break;
        default:
          startDate = moment().subtract(7, 'days').toDate();
          endDate = today;
      }

      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const [analyticsRes, overdueRes, workloadRes] = await Promise.all([
        analyticsService.getProductivityAnalytics(params),
        analyticsService.getOverdueTasks(),
        analyticsService.getWorkloadDistribution(),
      ]);

      setAnalytics(analyticsRes.data);
      setOverdueTasks(overdueRes.data);
      setWorkload(workloadRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const prepareProductivityData = () => {
    if (!analytics?.tasksPerDay || analytics.tasksPerDay.length === 0) {
      return null;
    }

    const labels = analytics.tasksPerDay.map(item =>
      moment(item.date).format('MMM D')
    );
    const data = analytics.tasksPerDay.map(item => {
      const val = item.count;
      // Prevent NaN and Infinity
      return isFinite(val) ? val : 0;
    });

    // Only return chart data if we have valid data
    if (!data.some(d => d > 0)) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareSubjectDistributionData = () => {
    if (!analytics?.tasksBySubject || analytics.tasksBySubject.length === 0) {
      return null;
    }

    const data = analytics.tasksBySubject
      .map((item, index) => ({
        name: item.subjectName,
        count: isFinite(item.count) ? Math.max(item.count, 0) : 0,
        color: item.subjectColor || getColorByIndex(index),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      }))
      .filter(item => item.count > 0);

    return data.length > 0 ? data : null;
  };

  const prepareStudyHoursData = () => {
    if (!analytics?.studyHoursPerDay || analytics.studyHoursPerDay.length === 0) {
      return null;
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = new Array(7).fill(0);

    analytics.studyHoursPerDay.forEach(item => {
      const hours = parseFloat(item.hours) || 0;
      data[item.dayOfWeek] = isFinite(hours) ? hours : 0;
    });

    // Only return chart data if we have valid data
    if (!data.some(d => d > 0)) {
      return null;
    }

    return {
      labels: days,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const getColorByIndex = (index) => {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#16a085', '#8e44ad',
    ];
    return colors[index % colors.length];
  };

  const getPriorityDistribution = () => {
    if (!analytics?.tasksByPriority) return null;
    
    const priorityData = {};
    analytics.tasksByPriority.forEach(item => {
      priorityData[item.priority] = item.count;
    });

    return priorityData;
  };

  const renderTimeRangeSelector = () => (
    <View style={[styles.timeRangeSelector, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
      {['week', 'month', 'semester'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            { backgroundColor: theme.background, borderColor: theme.border },
            timeRange === range && styles.activeTimeRangeButton,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              { color: theme.text },
              timeRange === range && styles.activeTimeRangeButtonText,
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsCards = () => {
    if (!analytics?.stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Icon name="assignment" size={24} color={theme.primary} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{analytics.stats.totalTasks}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Tasks</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Icon name="check-circle" size={24} color="#27ae60" />
          <Text style={[styles.statNumber, { color: theme.text }]}>{analytics.stats.completedTasks}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Icon name="pending" size={24} color="#f39c12" />
          <Text style={[styles.statNumber, { color: theme.text }]}>{analytics.stats.pendingTasks}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
        </View>
      </View>
    );
  };

  const renderCompletionRate = () => {
    const rate = analytics?.completionRate || 0;
    // Prevent NaN, Infinity from displaying
    const displayRate = isFinite(rate) ? rate : 0;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Completion Rate</Text>
        <View style={styles.completionRateContainer}>
          <View style={styles.completionCircle}>
            <Text style={styles.completionRateText}>
              {displayRate}%
            </Text>
          </View>
          <Text style={[styles.completionLabel, { color: theme.textSecondary }]}>
            of tasks completed in the last {timeRange}
          </Text>
        </View>
      </View>
    );
  };

  const renderProductivityChart = () => {
    const data = prepareProductivityData();
    
    if (!data) {
      return (
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Productivity</Text>
          <View style={styles.emptyStateContainer}>
            <Icon name="show-chart" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No productivity data available</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>Create some tasks to see your productivity trends</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Productivity</Text>
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: theme.cardBackground,
            backgroundGradientFrom: theme.cardBackground,
            backgroundGradientTo: theme.cardBackground,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(90, 159, 255, ${opacity})`,
            labelColor: (opacity = 1) => isDark ? `rgba(245, 245, 245, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffffff',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderSubjectDistribution = () => {
    const data = prepareSubjectDistributionData();
    
    if (!data || data.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks by Subject</Text>
          <View style={styles.emptyStateContainer}>
            <Icon name="book" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No subject data available</Text>
            <Text style={styles.emptyStateSubtext}>Add subjects and tasks to see distribution</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks by Subject</Text>
        <PieChart
          data={data}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderStudyHoursChart = () => {
    const data = prepareStudyHoursData();
    if (!data) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Study Hours</Text>
        <BarChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: theme.cardBackground,
            backgroundGradientFrom: theme.cardBackground,
            backgroundGradientTo: theme.cardBackground,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(90, 159, 255, ${opacity})`,
            labelColor: (opacity = 1) => isDark ? `rgba(245, 245, 245, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.5,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    );
  };

  const renderPriorityDistribution = () => {
    const priorityData = getPriorityDistribution();
    if (!priorityData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks by Priority</Text>
        <View style={styles.priorityDistribution}>
          {['high', 'medium', 'low'].map((priority) => (
            <View key={priority} style={styles.priorityItem}>
              <View style={styles.priorityHeader}>
                <View
                  style={[
                    styles.priorityDot,
                    {
                      backgroundColor:
                        priority === 'high'
                          ? '#e74c3c'
                          : priority === 'medium'
                          ? '#f39c12'
                          : '#27ae60',
                    },
                  ]}
                />
                <Text style={styles.priorityName}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </View>
              <Text style={styles.priorityCount}>
                {priorityData[priority] || 0} tasks
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOverdueTasks = () => {
    if (overdueTasks.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overdue Tasks</Text>
          <Text style={styles.overdueCount}>{overdueTasks.length}</Text>
        </View>
        {overdueTasks.slice(0, 3).map((task) => (
          <View key={task.id} style={styles.overdueTask}>
            <Icon name="warning" size={20} color="#e74c3c" />
            <View style={styles.overdueTaskInfo}>
              <Text style={styles.overdueTaskTitle}>{task.title}</Text>
              <Text style={styles.overdueTaskDate}>
                Due: {formatDateShort(task.dueDate)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWorkloadPreview = () => {
    const workloadDays = Object.keys(workload).slice(0, 3);
    if (workloadDays.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Workload</Text>
        {workloadDays.map((day) => (
          <View key={day} style={styles.workloadDay}>
            <Text style={styles.workloadDate}>
              {moment(day).format('MMM D, YYYY')}
            </Text>
            <Text style={styles.workloadCount}>
              {workload[day].length} tasks
            </Text>
          </View>
        ))}
      </View>
    );
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
          <Text style={[styles.title, { color: theme.text }]}>Progress Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Track your academic performance and productivity
          </Text>
        </View>

        {/* Time Range Selector */}
        {renderTimeRangeSelector()}

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Completion Rate */}
        {renderCompletionRate()}

        {/* Productivity Chart */}
        {renderProductivityChart()}

        {/* Subject Distribution */}
        {renderSubjectDistribution()}

        {/* Study Hours */}
        {renderStudyHoursChart()}

        {/* Priority Distribution */}
        {renderPriorityDistribution()}

        {/* Overdue Tasks */}
        {renderOverdueTasks()}

        {/* Workload Preview */}
        {renderWorkloadPreview()}

        {/* Empty State */}
        {!analytics && (
          <View style={styles.emptyState}>
            <Icon name="analytics" size={80} color="#ddd" />
            <Text style={styles.emptyStateTitle}>No Data Yet</Text>
            <Text style={styles.emptyStateText}>
              Complete some tasks to see your analytics
            </Text>
          </View>
        )}
      </ScrollView>
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
  timeRangeSelector: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeTimeRangeButton: {
    backgroundColor: '#5A9FFF',
    borderColor: '#5A9FFF',
  },
  timeRangeButtonText: {
    fontWeight: '500',
  },
  activeTimeRangeButtonText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  statCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginTop: 15,
    padding: 20,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionRateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completionCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5A9FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#5A9FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completionRateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  completionLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  priorityDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityItem: {
    alignItems: 'center',
    flex: 1,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  priorityName: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  priorityCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overdueCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  overdueTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  overdueTaskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  overdueTaskTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  overdueTaskDate: {
    fontSize: 12,
    color: '#e74c3c',
  },
  workloadDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workloadDate: {
    fontSize: 16,
    color: '#333',
  },
  workloadCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5A9FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default AnalyticsScreen;