import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {userToken == null ? (
            // Auth screens
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                options={{ title: 'Create Account' }}
              />
            </>
          ) : (
            // Main app screens
            <>
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen}
                options={{ title: 'Smart Student Planner' }}
              />
              <Stack.Screen 
                name="Tasks" 
                component={TasksScreen}
                options={{ title: 'My Tasks' }}
              />
              <Stack.Screen 
                name="TaskDetail" 
                component={TaskDetailScreen}
                options={{ title: 'Task Details' }}
              />
              <Stack.Screen 
                name="Schedule" 
                component={ScheduleScreen}
                options={{ title: 'Weekly Schedule' }}
              />
              <Stack.Screen 
                name="Subjects" 
                component={SubjectsScreen}
                options={{ title: 'My Subjects' }}
              />
              <Stack.Screen 
                name="Analytics" 
                component={AnalyticsScreen}
                options={{ title: 'Progress Analytics' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}