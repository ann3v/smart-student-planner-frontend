import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FAB_STYLE } from '../utils/constants';

const FAB = ({ icon = 'add', onPress, color = '#5A9FFF', iconColor = '#fff', iconSize = 28 }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, FAB_STYLE, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {},
});

export default FAB;