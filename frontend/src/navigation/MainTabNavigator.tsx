import React, { type ReactElement } from 'react';
import { createBottomTabNavigator, type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { MainTabParamList } from '../types';

import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TaskScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = (): ReactElement => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: 'dashboard' | 'assignment' | 'calendar-today' | 'menu-book' | 'analytics';

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Tasks':
              iconName = 'assignment';
              break;
            case 'Schedule':
              iconName = 'calendar-today';
              break;
            case 'Subjects':
              iconName = 'menu-book';
              break;
            case 'Analytics':
              iconName = 'analytics';
              break;
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
