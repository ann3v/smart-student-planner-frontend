import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = ({ style }) => {
  const { theme, themeMode, setTheme } = useTheme();

  const options = [
    { mode: 'light', icon: 'wb-sunny', label: 'Light' },
    { mode: 'dark', icon: 'nightlight-round', label: 'Dark' },
    { mode: 'system', icon: 'phone-android', label: 'System' },
  ];

  return (
    <View style={[styles.themeSelector, style]}>
      {options.map((option) => {
        const isSelected = themeMode === option.mode;
        return (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.themeOption,
              { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
              isSelected && styles.themeOptionSelected,
            ]}
            onPress={() => setTheme(option.mode)}
          >
            <MaterialIcons
              name={option.icon}
              size={24}
              color={isSelected ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.themeOptionText,
                { color: isSelected ? theme.primary : theme.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  themeSelector: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 15,
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
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ThemeSelector;
