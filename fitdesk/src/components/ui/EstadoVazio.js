import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';

export default function EstadoVazio({ icon = 'barbell-outline', title, message }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 24 },
  title: { fontSize: 18, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  message: { fontSize: 14, marginTop: 6, textAlign: 'center' },
});
