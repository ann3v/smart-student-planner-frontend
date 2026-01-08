import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/authContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import TaskDetailScreen from './src/screens/TaskDetailScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';

// Import MainTabNavigator
import MainTabNavigator from './src/navigation/MainTabNavigator.js';

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
    // You can return a loading screen here
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
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
      </NavigationContainer>
    </AuthProvider>
  );
}