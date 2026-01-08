import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/authContext.js';
import { authService } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    weeklyRecap: true,
    taskReminders: true,
    studyReminders: true,
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleToggleSetting = (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    saveSettings(newSettings);
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      // Here you would call an API to update profile
      // For now, we'll just update locally
      await AsyncStorage.setItem('userData', JSON.stringify({
        ...user,
        name: profileData.name,
      }));
      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully');
      // Refresh user context if needed
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      // Here you would call an API to change password
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleLogout = () => {
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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleClearData = () => {
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
              // Here you would call API to clear all data
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (icon, label, value, onToggle) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#4A90E2" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ddd', true: '#4A90E2' }}
        thumbColor="#fff"
      />
    </View>
  );

  const renderActionItem = (icon, label, onPress, color = '#333', showArrow = true) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      </View>
      {showArrow && <Icon name="chevron-right" size={24} color="#ddd" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => {
                  setProfileData({
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
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

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'dark-mode',
            'Dark Mode',
            settings.darkMode,
            () => handleToggleSetting('darkMode')
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
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
          <Text style={styles.appName}>Smart Student Planner</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 UMIB Students</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profileData.email}
                editable={false}
                placeholder="Email (cannot be changed)"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
});

export default SettingsScreen;