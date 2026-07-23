import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled || loading) return theme.disabled;
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.background;
      case 'danger':
        return theme.danger;
      case 'success':
        return theme.success;
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return '#fff';
    if (variant === 'secondary') return theme.text;
    return '#fff';
  };

  const getBorderColor = () => {
    if (variant === 'secondary') return theme.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;