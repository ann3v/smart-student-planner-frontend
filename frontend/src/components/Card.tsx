import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, onPress, style, padded = true }) => {
  const { theme } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        padded && styles.padded,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  padded: {
    padding: 15,
  },
});

export default Card;