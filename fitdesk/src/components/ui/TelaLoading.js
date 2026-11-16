import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../store/theme-context';
import { spacing } from '../../constants/theme';

// Tela de carregamento reutilizável.
// - message (opcional): texto abaixo da rodinha, ex.: "Carregando treinos...".
export default function TelaLoading({ message }) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Carregando'}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});