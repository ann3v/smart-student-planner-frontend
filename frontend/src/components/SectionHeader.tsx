import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle | ViewStyle[];
}

const SectionHeader = ({ title, actionLabel, onAction, style }: SectionHeaderProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.actionLabel, { color: theme.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionLabel: {
    fontSize: 14,
  },
});

export default SectionHeader;