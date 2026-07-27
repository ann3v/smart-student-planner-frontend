import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options?: Array<string | FilterOption>;
  activeOption: string;
  onSelect: (value: string) => void;
  style?: ViewStyle | ViewStyle[];
}

const FilterChips = ({ options = [], activeOption, onSelect, style }: FilterChipsProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }, style]}>
      {options.map((option) => {
        const label = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.value;
        const isActive = activeOption === value;
        return (
          <TouchableOpacity
            key={value}
            style={[
              styles.chip,
              { backgroundColor: theme.background, borderColor: theme.border },
              isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => onSelect(value)}
          >
            <Text style={[styles.chipText, { color: theme.text }, isActive && { color: '#fff' }]}>
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '500',
  },
});

export default FilterChips;