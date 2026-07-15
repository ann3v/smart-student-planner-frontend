import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPriorityColor } from '../utils/constants';

const PriorityBadge = ({ priority, style }) => {
  const backgroundColor = getPriorityColor(priority);
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={styles.text}>{priority}</Text>
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
    textTransform: 'capitalize',
  },
});

export default PriorityBadge;