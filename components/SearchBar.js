import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../styles/common';

// used on notes screen etc
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  containerStyle,
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name="search-outline" size={20} color={colors.textLight} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    color: colors.text,
  },
});