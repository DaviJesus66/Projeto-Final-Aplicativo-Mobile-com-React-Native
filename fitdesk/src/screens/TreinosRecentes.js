import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWorkouts } from '../store/workouts-context';
import { useTheme } from '../store/theme-context';
import TreinoSaida from '../components/treino/TreinoSaida';
import ResumoSemana from '../components/treino/ResumoSemana';
import { isWithinLastDays } from '../utils/date';

export default function TreinosRecentes() {
  const { workouts } = useWorkouts();
  const { colors } = useTheme();

  const recent = useMemo(() => workouts.filter((w) => isWithinLastDays(w.date, 7)), [workouts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TreinoSaida
        workouts={recent}
        headerExtra={<ResumoSemana workouts={recent} />}
        emptyTitle="Sem treinos nos últimos 7 dias"
        emptyMessage="Escolha um exercício na aba Treinar e registre o seu treino."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
});
