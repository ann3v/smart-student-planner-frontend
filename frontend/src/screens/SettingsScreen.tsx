import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import notificationService from '../services/notificationService';
import { SettingsRow, ThemeSelector, Button, Input } from '../components';
import { useForm } from '../hooks/useForm';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    weeklyRecap: true,
    taskReminders: true,
    studyReminders: true,
  });
  const [remindersCount, setRemindersCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);

  const profileForm = useForm({
    name: user?.name || '',
    email: user?.email || '',
  });

  const passwordForm = useForm({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings && isMounted) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch {
        // Settings load failed silently
      }
    };

    const loadNotificationSettings = async () => {
      try {
        const count = await notificationService.getRemindersCount();
        if (isMounted) setRemindersCount(count);
      } catch {
        // Notification settings load failed silently
      }
    };

    loadSettings();
    loadNotificationSettings();

    return () => { isMounted = false; };
  }, []);

  const handleToggleSetting = useCallback((setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      AsyncStorage.setItem('appSettings', JSON.stringify(newSettings)).catch(() => {});
      return newSettings;
    });
  }, []);

  const handleUpdateProfile = useCallback(async () => {
    if (!profileForm.values.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      await AsyncStorage.setItem('userData', JSON.stringify({
        ...user,
        name: profileForm.values.name,
      }));
      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  }, [user, profileForm.values.name]);

  const handleChangePassword = useCallback(async () => {
    if (!passwordForm.values.currentPassword || !passwordForm.values.newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordForm.values.newPassword !== passwordForm.values.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.values.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch {
      Alert.alert('Error', 'Failed to change password');
    }
  }, [passwordForm]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your tasks, subjects, and schedule. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Success', 'All data has been cleared');
            } catch {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  }, []);

  const renderSettingItem = useCallback((icon: string, label: string, value: boolean, onToggle: () => void) => (
    <SettingsRow icon={icon} label={label} value={value} onToggle={onToggle} />
  ), []);

  const renderActionItem = useCallback((icon: string, label: string, onPress: () => void, color?: string, showArrow = true) => (
    <SettingsRow icon={icon} label={label} onPress={onPress} color={color} showArrow={showArrow} />
  ), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ backgroundColor: theme.background }}
      >
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => {
                  profileForm.setAllValues({
                    name: user?.name || '',
                    email: user?.email || '',
                  });
                  setShowProfileModal(true);
                }}
              >
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Notifications</Text>
          {renderSettingItem(
            'notifications',
            'Push Notifications',
            settings.notifications,
            () => handleToggleSetting('notifications')
          )}
          {renderSettingItem(
            'alarm',
            'Task Reminders',
            settings.taskReminders,
            () => handleToggleSetting('taskReminders')
          )}
          {renderSettingItem(
            'school',
            'Study Reminders',
            settings.studyReminders,
            () => handleToggleSetting('studyReminders')
          )}
          {renderSettingItem(
            'email',
            'Weekly Recap',
            settings.weeklyRecap,
            () => handleToggleSetting('weeklyRecap')
          )}
        </View>

        {/* Reminders Management */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <View style={styles.remindersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Active Reminders</Text>
            <TouchableOpacity
              style={styles.remindersCount}
              onPress={() => setShowRemindersModal(true)}
            >
              <Icon name="schedule" size={16} color="#fff" />
              <Text style={styles.remindersCountText}>{remindersCount}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.viewRemindersButton}
            onPress={() => setShowRemindersModal(true)}
          >
            <Icon name="notifications-active" size={20} color="#4A90E2" />
            <Text style={styles.viewRemindersButtonText}>
              View & Manage Reminders
            </Text>
            <Icon name="chevron-right" size={20} color="#ddd" />
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <ThemeSelector />
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Account</Text>
          {renderActionItem(
            'vpn-key',
            'Change Password',
            () => setShowPasswordModal(true),
            '#333'
          )}
          {renderActionItem(
            'backup',
            'Export Data',
            () => Alert.alert('Info', 'Export feature coming soon'),
            '#333'
          )}
          {renderActionItem(
            'help',
            'Help & Support',
            () => Alert.alert('Support', 'Contact: support@studentplanner.com'),
            '#333'
          )}
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle, { borderBottomColor: theme.border }]}>Danger Zone</Text>
          {renderActionItem(
            'delete',
            'Clear All Data',
            handleClearData,
            '#e74c3c',
            false
          )}
          {renderActionItem(
            'delete-forever',
            'Delete Account',
            () => Alert.alert('Info', 'Account deletion feature coming soon'),
            '#e74c3c',
            false
          )}
          {renderActionItem(
            'exit-to-app',
            'Logout',
            handleLogout,
            '#e74c3c',
            false
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: theme.text }]}>Smart Student Planner</Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appCopyright, { color: theme.textTertiary }]}>© 2024 UMIB Students</Text>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfileModal}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
              <Input
                value={profileForm.values.name}
                onChangeText={(text) => profileForm.handleChange('name', text)}
                placeholder="Enter your name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
              <Input
                value={profileForm.values.email}
                editable={false}
                placeholder="Email (cannot be changed)"
                placeholderTextColor={theme.textTertiary}
                disabled
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowProfileModal(false)}
                variant="secondary"
              />
              <Button
                title="Save"
                onPress={handleUpdateProfile}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Current Password</Text>
              <Input
                value={passwordForm.values.currentPassword}
                onChangeText={(text) => passwordForm.handleChange('currentPassword', text)}
                placeholder="Enter current password"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>New Password</Text>
              <Input
                value={passwordForm.values.newPassword}
                onChangeText={(text) => passwordForm.handleChange('newPassword', text)}
                placeholder="Enter new password"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm New Password</Text>
              <Input
                value={passwordForm.values.confirmPassword}
                onChangeText={(text) => passwordForm.handleChange('confirmPassword', text)}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPasswordModal(false);
                  passwordForm.reset();
                }}
                variant="secondary"
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Reminders Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRemindersModal}
        onRequestClose={() => setShowRemindersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.remindersModalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Active Reminders</Text>
              <TouchableOpacity onPress={() => setShowRemindersModal(false)}>
                <Icon name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            {remindersCount > 0 ? (
              <ScrollView
                style={[styles.remindersList, { backgroundColor: theme.cardBackground }]}
                contentContainerStyle={{ backgroundColor: theme.cardBackground }}
              >
                <Text style={[styles.remindersInfo, { color: theme.textSecondary }]}>
                  You have {remindersCount} active reminders set
                </Text>
              </ScrollView>
            ) : (
              <View style={styles.noRemindersContainer}>
                <Icon name="notifications-off" size={48} color={theme.textTertiary} />
                <Text style={[styles.noRemindersText, { color: theme.text }]}>
                  No active reminders
                </Text>
                <Text style={[styles.noRemindersSubtext, { color: theme.textSecondary }]}>
                  Add reminders to your tasks and scheduled sessions to stay on track
                </Text>
              </View>
            )}

            <Button
              title="Close"
              onPress={() => setShowRemindersModal(false)}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editProfileButtonText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dangerTitle: {
    color: '#e74c3c',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersCount: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindersCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewRemindersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e8ff',
  },
  viewRemindersButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  remindersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  remindersList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  remindersInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  noRemindersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRemindersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  noRemindersSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  remindersModalButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  remindersModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  themeOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SettingsScreen;