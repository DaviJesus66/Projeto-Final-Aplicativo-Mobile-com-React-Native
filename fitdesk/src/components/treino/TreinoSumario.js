import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../store/theme-context';
import { cardShadow, radius } from '../../constants/theme';

// Quantidade de treinos e total de séries das linhas exibidas.
export default function TreinoSumario({ workouts }) {
  const { colors } = useTheme();
  const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);

  return (
    <View style={[styles.box, cardShadow, { backgroundColor: colors.card }]}>
      <View style={styles.col}>
        <Text style={[styles.value, { color: colors.primary }]}>{workouts.length}</Text>
        <Text style={{ color: colors.textMuted }}>{workouts.length === 1 ? 'treino' : 'treinos'}</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.col}>
        <Text style={[styles.value, { color: colors.primary }]}>{totalSets}</Text>
        <Text style={{ color: colors.textMuted }}>séries no total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', padding: 14, marginHorizontal: 6, marginBottom: 6, borderRadius: radius.md },
  col: { flex: 1, alignItems: 'center' },
  value: { fontSize: 26, fontWeight: '800' },
  divider: { width: 1 },
});
