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
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/authContext';
import { useForm } from '../hooks/useForm';
import { Button, Input } from '../components';
import { validateEmail } from '../utils/validation';

const VerifyScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { verifyCode, isLoading } = useAuth();
  const prefilledEmail = route.params?.email || '';
  
  const form = useForm({
    email: prefilledEmail,
    code: '',
  });

  const handleVerify = async () => {
    const emailError = validateEmail(form.values.email);
    
    if (emailError) {
      Alert.alert('Error', emailError);
      return;
    }

    if (!form.values.code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    const result = await verifyCode(form.values.email, form.values.code.trim());
    if (result.success) {
      Alert.alert('Verified', 'Your account has been verified.', [
        { text: 'Continue', onPress: () => navigation.replace('MainTabs') },
      ]);
    } else {
      Alert.alert('Verification Failed', result.error || 'Invalid or expired code');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.primary }]}>Verify Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter the 6-digit code we emailed to you.
          </Text>

          <View style={[styles.form, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
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
              value={form.values.code}
              onChangeText={(text) => form.handleChange('code', text)}
              placeholder="123456"
              placeholderTextColor={theme.textTertiary}
              icon="verified-user"
              iconColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={6}
              editable={!isLoading}
              style={styles.codeInput}
            />

            <Button
              title={isLoading ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              disabled={isLoading}
              variant="primary"
            />

            <Button
              title="Back to Login"
              onPress={() => navigation.replace('Login')}
              variant="link"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  form: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});

export default VerifyScreen;