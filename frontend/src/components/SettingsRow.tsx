import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SettingsRowProps {
  icon: any;
  label: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  color?: string;
  showArrow?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const SettingsRow = ({ icon, label, value, onToggle, onPress, color, showArrow = true, style }: SettingsRowProps) => {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;

  if (onToggle) {
    return (
      <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }, style]}>
        <View style={styles.settingLeft}>
          <MaterialIcons name={icon} size={24} color={iconColor} />
          <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#ddd', true: theme.primary }}
          thumbColor="#fff"
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.actionItem, { borderBottomColor: theme.borderLight }, style]}
      onPress={onPress}
    >
      <View style={styles.actionLeft}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
        <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
      </View>
      {showArrow && <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default SettingsRow;