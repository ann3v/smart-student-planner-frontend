import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/authContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './src/services/notificationService';
import type { RootStackParamList } from './src/types';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import MainTabNavigator
import MainTabNavigator from './src/navigation/MainTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

type RootNavigatorProps = {
  userToken: string | null;
  setUserToken: React.Dispatch<React.SetStateAction<string | null>>;
};

const RootNavigator = React.memo(function RootNavigator({ userToken }: RootNavigatorProps) {
  return (
    <Stack.Navigator
      id="RootStack"
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
});

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const { user, loadUser } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        await notificationService.requestPermissions();

        notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          if (!isMounted) return;
          const data = response.notification.request.content.data as
            | { type?: string; taskId?: number; scheduleId?: number }
            | undefined;

          if (data?.type === 'task-reminder' && data.taskId) {
            navigationRef.current?.navigate('TaskDetail', { taskId: data.taskId });
          } else if (data?.type === 'schedule-reminder' && data.scheduleId) {
            navigationRef.current?.navigate('MainTabs', {
              screen: 'Schedule',
              params: { scheduleId: data.scheduleId },
            } as never);
          }
        });
      } catch {
        // Notification setup failed — app continues without notifications
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        (Notifications as any).removeNotificationSubscription?.(notificationListener.current);
      }
      if (responseListener.current) {
        (Notifications as any).removeNotificationSubscription?.(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (isMounted) setUserToken(token);
        if (token) {
          await loadUser();
        }
      } catch (e) {
        // Token load failed — user will see login screen
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrapAsync();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncTokenWithUser = async () => {
      if (user) {
        const token = await AsyncStorage.getItem('userToken');
        if (isMounted) setUserToken(token);
      } else {
        setUserToken(null);
      }
    };
    syncTokenWithUser();

    return () => { isMounted = false; };
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