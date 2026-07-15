import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ModalWrapper = ({
  visible,
  onClose,
  title,
  children,
  backgroundColor,
  scrollable = false,
  style,
}) => {
  const { theme } = useTheme();
  const bg = backgroundColor || theme.cardBackground;

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: bg }, style]}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>
          )}
          <ContentWrapper>{children}</ContentWrapper>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
});

export default ModalWrapper;