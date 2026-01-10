import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import DashboardScreen from '../screens/DashboradScreen.js';
import TasksScreen from '../screens/TaskScreen.js';
import ScheduleScreen from '../screens/ScheduleScreen.js';
import SubjectsScreen from '../screens/SubjectsScreen.js';
import AnalyticsScreen from '../screens/AnalyticsScreen.js';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

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
