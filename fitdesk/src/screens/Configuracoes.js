import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../store/theme-context';
import { useWorkouts } from '../store/workouts-context';
import { useFeedback } from '../store/feedback-context';
import Chip from '../components/ui/Chip';
import Botao from '../components/ui/Botao';
import { cardShadow, radius } from '../constants/theme';
import {
  LEMBRETE_PADRAO,
  alterarHorario,
  ativarLembrete,
  carregarLembrete,
  desativarLembrete,
  formatarHorario,
} from '../services/lembrete';

const MODES = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function Configuracoes() {
  const { colors, mode, setMode } = useTheme();
  const { workouts, clearWorkouts } = useWorkouts();
  const { showSuccess, showError, showInfo } = useFeedback();

  const [lembrete, setLembrete] = useState(LEMBRETE_PADRAO);
  const [ocupado, setOcupado] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  useEffect(() => {
    carregarLembrete().then(setLembrete);
  }, []);

  function confirmClear() {
    Alert.alert('Limpar treinos', 'Todos os treinos registrados serão apagados. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar tudo',
        style: 'destructive',
        onPress: () => {
          clearWorkouts();
          showSuccess('Todos os treinos foram apagados.');
        },
      },
    ]);
  }

  async function handleToggle(ligar) {
    setOcupado(true);
    try {
      if (ligar) {
        const resultado = await ativarLembrete(lembrete.hour, lembrete.minute);
        if (!resultado.ok) {
          showError('Permita as notificações nas configurações do aparelho.');
          return;
        }
        setLembrete(resultado.config);
        showSuccess(`Lembrete diário ativado para ${formatarHorario(lembrete.hour, lembrete.minute)}.`);
      } else {
        setLembrete(await desativarLembrete());
        showInfo('Lembrete desativado.');
      }
    } catch (e) {
      showError('Não foi possível configurar o lembrete neste dispositivo.');
    } finally {
      setOcupado(false);
    }
  }

  async function handleHorario(event, selecionado) {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'dismissed' || !selecionado) return;
    const hour = selecionado.getHours();
    const minute = selecionado.getMinutes();
    try {
      const config = await alterarHorario(hour, minute);
      setLembrete(config);
      if (config.enabled) showSuccess(`Lembrete reagendado para ${formatarHorario(hour, minute)}.`);
    } catch (e) {
      showError('Não foi possível alterar o horário do lembrete.');
    }
  }

  const horaPicker = new Date();
  horaPicker.setHours(lembrete.hour, lembrete.minute, 0, 0);

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
        <View style={styles.linha}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Lembrete de treino</Text>
            <Text style={{ color: colors.textMuted }}>Uma notificação todos os dias no horário escolhido.</Text>
          </View>
          <Switch
            value={lembrete.enabled}
            onValueChange={handleToggle}
            disabled={ocupado}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <Pressable
          onPress={() => Platform.OS === 'android' && setMostrarPicker(true)}
          style={[styles.horario, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
        >
          <Ionicons name="time-outline" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 16, flex: 1, marginLeft: 8 }}>Horário</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker value={horaPicker} mode="time" display="compact" is24Hour onChange={handleHorario} />
          ) : (
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
              {formatarHorario(lembrete.hour, lembrete.minute)}
            </Text>
          )}
        </Pressable>

        {mostrarPicker && Platform.OS === 'android' ? (
          <DateTimePicker value={horaPicker} mode="time" is24Hour onChange={handleHorario} />
        ) : null}
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
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  horario: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
