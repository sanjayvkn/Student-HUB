import { StyleSheet } from 'react-native';

export const colors = {
  background: '#ffffff',
  white: '#ffffff',
  primary: '#5b6fd8',
  primaryLight: '#eef0fb',
  text: '#1a1a1a',
  textLight: '#666666',
  border: '#cccccc',
  borderLight: '#e0e0e0',
  green: '#22a06b',
  tabInactive: '#888888',
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
});
