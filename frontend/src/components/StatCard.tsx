import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  icon?: any;
  iconColor?: string;
  value: number | string;
  label: string;
  valueColor?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

const StatCard = ({ icon, iconColor, value, label, valueColor, onPress, style }: StatCardProps) => {
  const { theme } = useTheme();

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && <MaterialIcons name={icon} size={24} color={iconColor || theme.primary} />}
      <Text style={[styles.value, { color: valueColor || theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
  },
});

export default StatCard;