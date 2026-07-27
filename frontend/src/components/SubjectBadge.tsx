import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { DEFAULT_SUBJECT_COLOR } from '../utils/constants';

interface SubjectBadgeProps {
  name: string;
  color?: string;
  style?: ViewStyle | ViewStyle[];
}

const SubjectBadge = ({ name, color, style }: SubjectBadgeProps) => {
  return (
    <View style={[styles.badge, { backgroundColor: color || DEFAULT_SUBJECT_COLOR }, style]}>
      <Text style={styles.text}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SubjectBadge;