import React, { useState, useCallback } from 'react';
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
import {
  LineChart,
  PieChart,
  BarChart,
} from 'react-native-chart-kit';
import moment from 'moment';
import { formatDateShort } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { useFocusRefresh } from '../hooks/useFocusRefresh';
import { useAnalytics } from '../hooks/useAnalytics';
import { FilterChips, StatCard, EmptyState } from '../components';
import { TIME_RANGES, getChartColorByIndex } from '../utils/constants';
import { prepareProductivityData, prepareSubjectDistributionData, prepareStudyHoursData, getPriorityDistribution } from '../utils/analyticsUtils';

const AnalyticsScreen = () => {
  const { theme, isDark } = useTheme();
  const { analytics, overdueTasks, workload, loadAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  useFocusRefresh(() => loadAnalytics(), [loadAnalytics]);

  const renderTimeRangeSelector = () => (
    <FilterChips
      options={TIME_RANGES}
      activeOption={timeRange}
      onSelect={setTimeRange}
    />
  );

  const renderStatsCards = () => {
    if (!analytics?.stats) return null;
    return (
      <View style={styles.statsContainer}>
        <StatCard icon="assignment" iconColor={theme.primary} value={analytics.stats.totalTasks} label="Total Tasks" />
        <StatCard icon="check-circle" iconColor="#27ae60" value={analytics.stats.completedTasks} label="Completed" />
        <StatCard icon="pending" iconColor="#f39c12" value={analytics.stats.pendingTasks} label="Pending" />
      </View>
    );
  };

  const renderCompletionRate = () => {
    const rate = analytics?.completionRate || 0;
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
    const data = prepareProductivityData(analytics);

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
    const data = prepareSubjectDistributionData(analytics, theme, getChartColorByIndex);

    if (!data || data.length === 0) {
      return (
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks by Subject</Text>
          <View style={[styles.emptyStateContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Icon name="book" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No subject data available</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>Add subjects and tasks to see distribution</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks by Subject</Text>
        <PieChart
          data={data}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => isDark ? `rgba(245, 245, 245, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
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
    const data = prepareStudyHoursData(analytics);
    if (!data) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Study Hours</Text>
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
    const priorityData = getPriorityDistribution(analytics);
    if (!priorityData) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks by Priority</Text>
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
                <Text style={[styles.priorityName, { color: theme.text }]}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </View>
              <Text style={[styles.priorityCount, { color: theme.text }]}>
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
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overdue Tasks</Text>
          <Text style={styles.overdueCount}>{overdueTasks.length}</Text>
        </View>
        {overdueTasks.slice(0, 3).map((task) => (
          <View
            key={task.id}
            style={[
              styles.overdueTask,
              { backgroundColor: isDark ? '#2a1a1a' : '#fff5f5', borderLeftColor: theme.danger },
            ]}
          >
            <Icon name="warning" size={20} color={theme.danger} />
            <View style={styles.overdueTaskInfo}>
              <Text style={[styles.overdueTaskTitle, { color: theme.text }]}>{task.title}</Text>
              <Text style={[styles.overdueTaskDate, { color: theme.danger }]}>
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
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Workload</Text>
        {workloadDays.map((day) => (
          <View key={day} style={[styles.workloadDay, { borderBottomColor: theme.border }]}>
            <Text style={[styles.workloadDate, { color: theme.text }]}>
              {moment(day).format('MMM D, YYYY')}
            </Text>
            <Text style={[styles.workloadCount, { color: theme.primary }]}>
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
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Progress Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Track your academic performance and productivity
          </Text>
        </View>

        {renderTimeRangeSelector()}

        {renderStatsCards()}

        {renderCompletionRate()}

        {renderProductivityChart()}

        {renderSubjectDistribution()}

        {renderStudyHoursChart()}

        {renderPriorityDistribution()}

        {renderOverdueTasks()}

        {renderWorkloadPreview()}

        {!analytics && (
          <EmptyState
            icon="analytics"
            title="No Data Yet"
            subtitle="Complete some tasks to see your analytics"
          />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
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