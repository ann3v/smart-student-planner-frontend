import React, { type ReactNode } from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions, type TextInputProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputProps {
  label?: string;
  value: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  editable?: boolean;
  maxLength?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode | string;
  onRightIconPress?: () => void;
  error?: string;
  style?: StyleProp<ViewStyle | TextStyle>;
  inputStyle?: StyleProp<ViewStyle | TextStyle>;
  icon?: string;
  iconColor?: string;
}

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  editable = true,
  disabled = false,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  inputStyle,
  icon,
  iconColor,
}: InputProps) => {
  const { theme } = useTheme();
  const resolvedLeftIcon = leftIcon ?? (icon ? <MaterialIcons name={icon as never} size={20} color={iconColor || theme.textSecondary} /> : null);
  const resolvedRightIcon = typeof rightIcon === 'string'
    ? <MaterialIcons name={rightIcon as never} size={20} color={iconColor || theme.textSecondary} onPress={onRightIconPress} />
    : rightIcon;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: error ? theme.danger : theme.border }, inputStyle]}>
        {resolvedLeftIcon}
        <TextInput
          style={[styles.input, { color: editable ? theme.text : theme.textSecondary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || theme.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable && !disabled}
          maxLength={maxLength}
        />
        {resolvedRightIcon}
      </View>
      {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;