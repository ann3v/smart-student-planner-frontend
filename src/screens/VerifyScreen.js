import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/authContext';

const VerifyScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { verifyCode, isLoading } = useAuth();
  const prefilledEmail = route.params?.email || '';
  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!email || !code) {
      Alert.alert('Error', 'Please enter both email and code');
      return;
    }

    const result = await verifyCode(email, code.trim());
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
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Email"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 12 }]}>Verification Code</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, letterSpacing: 4, textAlign: 'center' }]}
              placeholder="123456"
              placeholderTextColor={theme.textTertiary}
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={[styles.linkText, { color: theme.primary }]}>Back to Login</Text>
            </TouchableOpacity>
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
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});

export default VerifyScreen;
