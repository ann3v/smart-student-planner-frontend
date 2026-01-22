import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/authContext.js';
import { ThemeProvider } from './src/context/ThemeContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './src/services/notificationService.js';

// Import screens
import LoginScreen from './src/screens/LoginScreen.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import VerifyScreen from './src/screens/VerifyScreen.js';
import TaskDetailScreen from './src/screens/TaskDetailScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';

// Import MainTabNavigator
import MainTabNavigator from './src/navigation/MainTabNavigator.js';

const Stack = createStackNavigator();

function RootNavigator({ userToken, setUserToken }) {
  return (
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
        // Auth screens - No token, show auth screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              headerShown: false,
              animationTypeForReplace: userToken ? 'push' : 'pop'
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'Create Account',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Verify" 
            component={VerifyScreen}
            options={{ 
              title: 'Verify Email',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </>
      ) : (
        // Main app screens - User is authenticated
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TaskDetail" 
            component={TaskDetailScreen}
            options={{ 
              title: 'Task Details',
              headerBackTitle: 'Back'
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'Settings',
              headerBackTitle: 'Back'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const { user, loadUser } = useAuth();
  const navigationRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request notification permissions and setup listeners
    const setupNotifications = async () => {
      try {
        // Request permissions
        await notificationService.requestPermissions();

        // Set up notification event listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
          // Handle notification received while app is in foreground
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          const data = response.notification.request.content.data;

          // Navigate to relevant screen based on notification type
          if (data.type === 'task-reminder' && data.taskId) {
            navigationRef.current?.navigate('TaskDetail', { taskId: data.taskId });
          } else if (data.type === 'schedule-reminder' && data.scheduleId) {
            navigationRef.current?.navigate('MainTabs', {
              screen: 'Schedule',
              params: { scheduleId: data.scheduleId }
            });
          }
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Cleanup listeners
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
        // Attempt to load user data if present
        await loadUser();
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Update userToken when user logs in/out
  useEffect(() => {
    const syncTokenWithUser = async () => {
      if (user) {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } else {
        // If user is logged out, clear token state to show auth screens
        setUserToken(null);
      }
    };
    syncTokenWithUser();
  }, [user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator userToken={userToken} setUserToken={setUserToken} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}