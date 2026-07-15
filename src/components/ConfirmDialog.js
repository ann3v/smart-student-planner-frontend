import React from 'react';
import { Alert } from 'react-native';

/**
 * Reusable confirmation dialog wrapping Alert.alert.
 * Returns a Promise that resolves to true (confirmed) or false (cancelled).
 */
const ConfirmDialog = ({ title, message, confirmText = 'Delete', cancelText = 'Cancel', destructive = true }) => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
};

export default ConfirmDialog;