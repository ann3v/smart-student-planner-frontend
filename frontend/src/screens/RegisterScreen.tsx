import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';
import { Button, Input } from '../components';
import { validateEmail, validatePassword } from '../utils/validation';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    replace: (screen: string, params?: { email?: string }) => void;
    goBack: () => void;
  };
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();
  
  const form = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleRegister = async () => {
    const emailError = validateEmail(form.values.email);
    const passwordError = validatePassword(form.values.password);
    
    if (!form.values.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (emailError) {
      Alert.alert('Error', emailError);
      return;
    }

    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    if (form.values.password !== form.values.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const result = await register(form.values.email, form.values.password, form.values.name);

    if (result.success && result.requiresVerification) {
      Alert.alert(
        'Verify your email',
        'We sent a 6-digit code to your email. Please verify your account before logging in.',
        [
          {
            text: 'Enter Code',
            onPress: () => navigation.replace('Verify', { email: form.values.email }),
          },
        ]
      );
      return;
    }

    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <Button
            icon="arrow-back"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.primary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join Smart Student Planner today</Text>

            <View style={[styles.form, { backgroundColor: theme.cardBackground }]}>
              {/* Name Input */}
              <Input
                value={form.values.name}
                onChangeText={(text) => form.handleChange('name', text)}
                placeholder="Full Name"
                placeholderTextColor={theme.textTertiary}
                icon="person"
                iconColor={theme.textSecondary}
                editable={!isLoading}
              />

              {/* Email Input */}
              <Input
                value={form.values.email}
                onChangeText={(text) => form.handleChange('email', text)}
                placeholder="Email Address"
                placeholderTextColor={theme.textTertiary}
                icon="email"
                iconColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />

              {/* Password Input */}
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

              {/* Confirm Password Input */}
              <Input
                value={form.values.confirmPassword}
                onChangeText={(text) => form.handleChange('confirmPassword', text)}
                placeholder="Confirm Password"
                placeholderTextColor={theme.textTertiary}
                icon="lock-outline"
                iconColor={theme.textSecondary}
                secureTextEntry={!showConfirmPassword}
                editable={isLoading}
                rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementItem}>
                  <Icon
                    name={form.values.password.length >= 8 ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={form.values.password.length >= 8 ? '#27ae60' : '#999'}
                  />
                  <Text style={[
                    styles.requirementText,
                    form.values.password.length >= 8 && styles.requirementMet
                  ]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Icon
                    name={form.values.password === form.values.confirmPassword && form.values.password.length > 0 ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={form.values.password === form.values.confirmPassword && form.values.password.length > 0 ? '#27ae60' : '#999'}
                  />
                  <Text style={[
                    styles.requirementText,
                    form.values.password === form.values.confirmPassword && form.values.password.length > 0 && styles.requirementMet
                  ]}>
                    Passwords match
                  </Text>
                </View>
              </View>

              <Button
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                disabled={isLoading}
                variant="primary"
              />

              {/* Terms and Conditions */}
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Button
                  title="Sign in"
                  onPress={() => navigation.navigate('Login')}
                  variant="link"
                />
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#27ae60',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default RegisterScreen;