import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../store/theme-context';
import { cardShadow, radius, spacing } from '../../constants/theme';

// Cartão reutilizável.
// - title (opcional): título em negrito no topo do cartão.
// - onPress (opcional): se existir, o cartão vira "clicável".
// - style (opcional): estilos extras (ex.: margem).
export default function Cartao({ title, children, onPress, style }) {
  const { colors } = useTheme();

  const containerStyle = [
    styles.base,
    { backgroundColor: colors.card, borderColor: colors.border },
    cardShadow,
    style,
  ];

  const content = (
    <>
      {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...containerStyle, { opacity: pressed ? 0.85 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});