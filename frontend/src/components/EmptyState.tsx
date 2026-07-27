import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: any;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle | ViewStyle[];
}

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction, style }: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <MaterialIcons name={icon} size={60} color={theme.textTertiary} />}
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.action, { backgroundColor: theme.primary }]} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  action: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default EmptyState;