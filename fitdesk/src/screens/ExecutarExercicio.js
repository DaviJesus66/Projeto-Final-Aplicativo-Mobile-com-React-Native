import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/theme-context';
import { useAuth } from '../store/auth-context';
import { useWorkouts } from '../store/workouts-context';
import { useFeedback } from '../store/feedback-context';
import Botao from '../components/ui/Botao';
import useDebounce from '../hooks/useDebounce';
import { cardShadow, radius } from '../constants/theme';
import { confirmar } from '../utils/dialogo';
import {
  CARGA_MAX,
  CARGA_PASSO,
  MASCARA_CARGA,
  carregarCarga,
  formatarCarga,
  paraNumero,
  salvarCarga,
  ultimaCargaHistorico,
} from '../utils/cargas';

const DESCANSO_SEGUNDOS = 60;

// Haptics pode não existir em alguns aparelhos/emuladores, por isso nunca quebra o fluxo.
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
  const { user } = useAuth();
  const { workouts, addWorkout } = useWorkouts();
  const { showSuccess, showInfo } = useFeedback();
  const { exercise, group, muscle, sets, reps } = route.params;
  const uid = user ? user.id : null;

  // fase: 'parado' (antes de iniciar), 'treinando' (cronômetro correndo) ou 'descanso' (1 minuto).
  const [fase, setFase] = useState('parado');
  const [concluidas, setConcluidas] = useState(0);
  const [pesos, setPesos] = useState([]); // carga usada em cada série concluída
  const [segundos, setSegundos] = useState(0);
  const [restante, setRestante] = useState(DESCANSO_SEGUNDOS);
  const [salvo, setSalvo] = useState(false);
  const [carga, setCarga] = useState(''); // sempre com ponto decimal, ex.: "42.5"
  const salvoRef = useRef(false);
  const fimDescansoRef = useRef(0);
  const cargaTocada = useRef(false);

  const terminou = concluidas >= sets;
  const pesoAtual = paraNumero(carga) ?? 0;

  useLayoutEffect(() => {
    navigation.setOptions({ title: exercise });
  }, [navigation, exercise]);

  // Carga inicial: a última usada neste exercício (salva no aparelho) ou, na falta dela,
  // a do treino mais recente no histórico. Não sobrescreve se a pessoa já mexeu no campo.
  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const salva = uid ? await carregarCarga(uid, exercise) : null;
      const valor = salva ?? ultimaCargaHistorico(workouts, exercise);
      if (ativo && valor !== null && !cargaTocada.current) setCarga(String(valor));
    }
    carregar();
    return () => {
      ativo = false;
    };
    // O histórico só serve como valor inicial; não precisa reexecutar a cada mudança dele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, exercise]);

  // Guarda a carga depois que a pessoa para de digitar/ajustar.
  const cargaEstavel = useDebounce(carga, 500);
  useEffect(() => {
    if (!uid || !cargaTocada.current) return;
    const kg = paraNumero(cargaEstavel);
    if (kg !== null) salvarCarga(uid, exercise, kg);
  }, [cargaEstavel, uid, exercise]);

  // Cronômetro do exercício: só corre enquanto está treinando (pára no descanso).
  useEffect(() => {
    if (fase !== 'treinando' || terminou) return undefined;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [fase, terminou]);

  // Descanso de 1 minuto: conta regressiva pelo horário final (não perde tempo se a tela travar)
  // e, ao chegar em zero, volta sozinho para o exercício.
  useEffect(() => {
    if (fase !== 'descanso') return undefined;
    const id = setInterval(() => {
      const faltam = Math.max(0, Math.ceil((fimDescansoRef.current - Date.now()) / 1000));
      setRestante(faltam);
      if (faltam <= 0) {
        clearInterval(id);
        setFase('treinando');
        vibrar('sucesso');
        showInfo('Descanso terminou. Continue o exercício!');
      }
    }, 250);
    return () => clearInterval(id);
  }, [fase, showInfo]);

  function mudarCarga(texto) {
    if (!MASCARA_CARGA.test(texto)) return;
    cargaTocada.current = true;
    setCarga(texto.replace(',', '.'));
  }

  function ajustarCarga(delta) {
    const novo = Math.min(CARGA_MAX, Math.max(0, Math.round((pesoAtual + delta) * 100) / 100));
    cargaTocada.current = true;
    setCarga(String(novo));
    vibrar('leve');
  }

  // Grava o treino concluído (uma única vez) no contexto global de treinos,
  // com a maior carga usada nas séries feitas.
  function salvarTreino(seriesFeitas, listaPesos) {
    if (salvoRef.current || seriesFeitas < 1) return;
    salvoRef.current = true;
    const usados = listaPesos.slice(0, seriesFeitas).filter((p) => p > 0);
    addWorkout({
      exercise,
      group,
      muscle,
      sets: seriesFeitas,
      reps,
      weight: usados.length > 0 ? Math.max(...usados) : null,
      date: new Date().toISOString(),
    });
    setSalvo(true);
    showSuccess('Treino registrado no histórico!');
  }

  function handleIniciar() {
    setFase('treinando');
    vibrar('leve');
  }

  function handleDescansar() {
    fimDescansoRef.current = Date.now() + DESCANSO_SEGUNDOS * 1000;
    setRestante(DESCANSO_SEGUNDOS);
    setFase('descanso');
    vibrar('leve');
  }

  function handlePularDescanso() {
    setFase('treinando');
  }

  async function handleConcluirSerie() {
    const proxima = concluidas + 1;
    const novosPesos = [...pesos, pesoAtual];
    setConcluidas(proxima);
    setPesos(novosPesos);
    if (proxima >= sets) {
      salvarTreino(proxima, novosPesos);
      await vibrar('sucesso');
    } else {
      await vibrar('leve');
    }
  }

  function handleDesfazer() {
    if (concluidas > 0 && !terminou) {
      setConcluidas(concluidas - 1);
      setPesos(pesos.slice(0, -1));
    }
  }

  // Encerrar antes de completar todas as séries: pergunta se salva o que foi feito.
  function handleEncerrar() {
    confirmar({
      title: 'Encerrar exercício',
      message: `Você fez ${concluidas} de ${sets} séries. Deseja salvar mesmo assim?`,
      confirmText: 'Salvar e sair',
      cancelText: 'Continuar treinando',
      onConfirm: () => {
        salvarTreino(concluidas, pesos);
        navigation.goBack();
      },
    });
  }

  const emDescanso = fase === 'descanso';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
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
          <Text style={{ color: colors.textMuted, marginLeft: 6, fontSize: 16 }}>
            {formatTempo(segundos)}
            {emDescanso ? '  (pausado)' : ''}
          </Text>
        </View>
      </View>

      {!terminou ? (
        <View style={[styles.card, cardShadow, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
            Carga {fase === 'parado' ? 'do exercício' : `da série ${concluidas + 1}`}
          </Text>
          <View style={styles.cargaLinha}>
            <Pressable
              onPress={() => ajustarCarga(-CARGA_PASSO)}
              style={[styles.cargaBotao, { backgroundColor: colors.chip }]}
              accessibilityLabel="Diminuir carga"
            >
              <Ionicons name="remove" size={26} color={colors.primary} />
            </Pressable>
            <View style={styles.cargaCampo}>
              <TextInput
                value={formatarCarga(carga)}
                onChangeText={mudarCarga}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[styles.cargaInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                maxLength={6}
                selectTextOnFocus
              />
              <Text style={{ color: colors.textMuted, fontSize: 16, marginLeft: 8 }}>kg</Text>
            </View>
            <Pressable
              onPress={() => ajustarCarga(CARGA_PASSO)}
              style={[styles.cargaBotao, { backgroundColor: colors.chip }]}
              accessibilityLabel="Aumentar carga"
            >
              <Ionicons name="add" size={26} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
            Ajuste de {formatarCarga(CARGA_PASSO)} kg. A carga fica salva para este exercício.
          </Text>
        </View>
      ) : null}

      {emDescanso ? (
        <View style={[styles.card, cardShadow, { backgroundColor: colors.card, alignItems: 'center' }]}>
          <Ionicons name="cafe-outline" size={28} color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Descanso</Text>
          <Text style={[styles.contador, { color: colors.primary, fontSize: 56 }]}>{formatTempo(restante)}</Text>
          <View style={[styles.barra, { backgroundColor: colors.chip }]}>
            <View
              style={[
                styles.barraPreenchida,
                {
                  backgroundColor: colors.primary,
                  width: `${((DESCANSO_SEGUNDOS - restante) / DESCANSO_SEGUNDOS) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

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
      ) : fase === 'parado' ? (
        <Botao title="Iniciar exercício" icon="play" onPress={handleIniciar} />
      ) : (
        <View style={{ gap: 10 }}>
          {emDescanso ? (
            <Botao title="Pular descanso e continuar" icon="play-skip-forward" onPress={handlePularDescanso} />
          ) : (
            <>
              <Botao title={`Concluir série ${concluidas + 1}`} icon="checkmark" onPress={handleConcluirSerie} />
              <Botao
                title="Pausar e descansar 1 min"
                variant="outline"
                icon="pause"
                onPress={handleDescansar}
              />
            </>
          )}
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
  cargaLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  cargaBotao: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cargaCampo: { flexDirection: 'row', alignItems: 'center' },
  cargaInput: {
    minWidth: 100,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  barra: { alignSelf: 'stretch', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  barraPreenchida: { height: 8, borderRadius: 4 },
});
