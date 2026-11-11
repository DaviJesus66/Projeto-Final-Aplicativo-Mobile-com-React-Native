import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/theme-context';
import { useWorkouts } from '../store/workouts-context';
import Botao from '../components/ui/Botao';
import { cardShadow, radius } from '../constants/theme';


async function vibrar(tipo) {
  try {
    if (tipo === 'sucesso') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (e) {
    // ignora
  }
}

function formatTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function ExecutarExercicio({ route, navigation }) {
  const { colors } = useTheme();
  const { addWorkout } = useWorkouts();
  const { exercise, group, muscle, sets, reps } = route.params;

  const [iniciado, setIniciado] = useState(false);
  const [concluidas, setConcluidas] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [salvo, setSalvo] = useState(false);
  const salvoRef = useRef(false);

  const terminou = concluidas >= sets;

  useLayoutEffect(() => {
    navigation.setOptions({ title: exercise });
  }, [navigation, exercise]);

  
  useEffect(() => {
    if (!iniciado || terminou) return undefined;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [iniciado, terminou]);

  
  function salvarTreino(seriesFeitas) {
    if (salvoRef.current || seriesFeitas < 1) return;
    salvoRef.current = true;
    addWorkout({
      exercise,
      group,
      muscle,
      sets: seriesFeitas,
      reps,
      date: new Date().toISOString(),
    });
    setSalvo(true);
  }

  function handleIniciar() {
    setIniciado(true);
    vibrar('leve');
  }

  async function handleConcluirSerie() {
    const proxima = concluidas + 1;
    setConcluidas(proxima);
    if (proxima >= sets) {
      salvarTreino(proxima);
      await vibrar('sucesso');
    } else {
      await vibrar('leve');
    }
  }

  function handleDesfazer() {
    if (concluidas > 0 && !terminou) setConcluidas(concluidas - 1);
  }

  
  function handleEncerrar() {
    Alert.alert(
      'Encerrar exercício',
      `Você fez ${concluidas} de ${sets} séries. Deseja salvar mesmo assim?`,
      [
        { text: 'Continuar treinando', style: 'cancel' },
        {
          text: 'Salvar e sair',
          onPress: () => {
            salvarTreino(concluidas);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.card, cardShadow, { backgroundColor: colors.card }]}>
        <Text style={[styles.muscle, { color: colors.primary }]}>{muscle}</Text>
        <Text style={[styles.nome, { color: colors.text }]}>{exercise}</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          {sets} séries × {reps} repetições
        </Text>
      </View>

      <View style={[styles.card, cardShadow, { backgroundColor: colors.card, alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>Série atual</Text>
        <Text style={[styles.contador, { color: colors.text }]}>
          {terminou ? sets : concluidas + 1}
          <Text style={{ color: colors.textMuted, fontSize: 24 }}> / {sets}</Text>
        </Text>

        <View style={styles.bolinhas}>
          {Array.from({ length: sets }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < concluidas ? 'checkmark-circle' : 'ellipse-outline'}
              size={30}
              color={i < concluidas ? colors.success : colors.border}
            />
          ))}
        </View>

        <View style={styles.tempo}>
          <Ionicons name="timer-outline" size={18} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginLeft: 6, fontSize: 16 }}>{formatTempo(segundos)}</Text>
        </View>
      </View>

      {terminou ? (
        <View style={[styles.card, cardShadow, { backgroundColor: colors.card, alignItems: 'center' }]}>
          <Ionicons name="trophy" size={44} color={colors.success} />
          <Text style={[styles.nome, { color: colors.text, marginTop: 8 }]}>Exercício concluído!</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            {salvo ? 'Treino registrado no seu histórico.' : 'Salvando treino...'}
          </Text>
          <Botao
            title="Voltar à ficha"
            icon="arrow-back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16, alignSelf: 'stretch' }}
          />
        </View>
      ) : !iniciado ? (
        <Botao title="Iniciar exercício" icon="play" onPress={handleIniciar} />
      ) : (
        <View style={{ gap: 10 }}>
          <Botao title={`Concluir série ${concluidas + 1}`} icon="checkmark" onPress={handleConcluirSerie} />
          <View style={styles.linha}>
            <Botao
              title="Desfazer"
              variant="outline"
              icon="arrow-undo-outline"
              onPress={handleDesfazer}
              disabled={concluidas === 0}
              style={{ flex: 1 }}
            />
            <Botao
              title="Encerrar"
              variant="outline"
              icon="stop-circle-outline"
              onPress={concluidas === 0 ? () => navigation.goBack() : handleEncerrar}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  card: { padding: 20, borderRadius: radius.lg },
  muscle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  nome: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  contador: { fontSize: 64, fontWeight: '800', marginTop: 4 },
  bolinhas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 },
  tempo: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  linha: { flexDirection: 'row', gap: 10 },
});
