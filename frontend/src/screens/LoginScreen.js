import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext.js';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';
import { Button, Input } from '../components';
import { validateEmail, validatePassword } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();
  
  const form = useForm({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async () => {
    const emailError = validateEmail(form.values.email);
    const passwordError = validatePassword(form.values.password);
    
    if (emailError || passwordError) {
      Alert.alert('Error', emailError || passwordError);
      return;
    }

    const result = await login(form.values.email, form.values.password);
    if (result.success) {
      // Navigation is handled by App.js based on token
    } else {
      if (result.requiresVerification) {
        Alert.alert('Verify your email', result.error || 'Account not verified. Check your email for the code.', [
          {
            text: 'Enter Code',
            onPress: () => navigation.replace('Verify', { email: form.values.email }),
          },
        ]);
        return;
      }
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.primary }]}>Smart Student Planner</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Login to continue</Text>

          <View style={[styles.form, { backgroundColor: theme.cardBackground }]}>
            <Input
              value={form.values.email}
              onChangeText={(text) => form.handleChange('email', text)}
              placeholder="Email"
              placeholderTextColor={theme.textTertiary}
              icon="email"
              iconColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            
            <Input
              value={form.values.password}
              onChangeText={(text) => form.handleChange('password', text)}
              placeholder="Password"
              placeholderTextColor={theme.textTertiary}
              icon="lock"
              iconColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              rightIcon={showPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title={isLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={isLoading}
              variant="primary"
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
              <Button
                title="Sign up"
                onPress={() => navigation.navigate('Register')}
                variant="link"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default LoginScreen;