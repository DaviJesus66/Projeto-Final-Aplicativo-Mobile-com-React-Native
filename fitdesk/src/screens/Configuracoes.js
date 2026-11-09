import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../store/theme-context';
import { useWorkouts } from '../store/workouts-context';
import Chip from '../components/ui/Chip';
import Botao from '../components/ui/Botao';
import { cardShadow, radius } from '../constants/theme';

const MODES = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function Configuracoes() {
  const { colors, mode, setMode } = useTheme();
  const { workouts, clearWorkouts } = useWorkouts();

  function confirmClear() {
    Alert.alert('Limpar treinos', 'Todos os treinos registrados serão apagados. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar tudo', style: 'destructive', onPress: clearWorkouts },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.card, cardShadow, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Tema do aplicativo</Text>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
          Automático acompanha o tema do seu aparelho.
        </Text>
        <View style={styles.chips}>
          {MODES.map((m) => (
            <Chip key={m.value} label={m.label} selected={mode === m.value} onPress={() => setMode(m.value)} />
          ))}
        </View>
      </View>

      <View style={[styles.card, cardShadow, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Dados</Text>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
          {workouts.length} {workouts.length === 1 ? 'treino registrado' : 'treinos registrados'} neste aparelho.
        </Text>
        <Botao title="Limpar todos os treinos" variant="danger" icon="trash-outline" onPress={confirmClear} disabled={workouts.length === 0} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  card: { padding: 16, borderRadius: radius.lg, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
