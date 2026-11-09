import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../store/theme-context';

export default function Chip({ label, selected = false, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.primary : colors.chip, borderColor: selected ? colors.primary : colors.border },
      ]}
    >
      <Text style={{ color: selected ? colors.onPrimary : colors.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
