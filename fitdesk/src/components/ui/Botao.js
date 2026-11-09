import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { radius } from '../../constants/theme';

// variant: 'primary' | 'outline' | 'danger'
export default function Botao({ title, onPress, variant = 'primary', icon, loading = false, disabled = false, style }) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const bg = variant === 'danger' ? colors.error : isOutline ? 'transparent' : colors.primary;
  const fg = isOutline ? colors.primary : variant === 'danger' ? '#FFFFFF' : colors.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: isOutline ? colors.primary : bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={styles.icon} /> : null}
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: '700' },
});
