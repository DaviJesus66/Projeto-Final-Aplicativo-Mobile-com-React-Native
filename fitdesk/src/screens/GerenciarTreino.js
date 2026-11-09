import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useWorkouts } from '../store/workouts-context';
import { useTheme } from '../store/theme-context';
import { CampoSeletor, CampoTexto } from '../components/ui/Campo';
import SeletorModal from '../components/ui/SeletorModal';
import Botao from '../components/ui/Botao';
import { MUSCLE_OPTIONS, groupOfMuscle } from '../constants/workouts';
import { formatDate, isFuture } from '../utils/date';

// Regras: exercício com no mínimo 3 caracteres, séries e repetições > 0,
// data não futura e músculo obrigatório.
export function validate(values) {
  const errors = {};
  if (values.exercise.trim().length < 3) {
    errors.exercise = 'O exercício deve ter no mínimo 3 caracteres.';
  }
  if (!values.muscle) {
    errors.muscle = 'Escolha o músculo trabalhado.';
  }
  if (!(parseInt(values.sets, 10) > 0)) {
    errors.sets = 'As séries devem ser maiores que zero.';
  }
  if (!(parseInt(values.reps, 10) > 0)) {
    errors.reps = 'As repetições devem ser maiores que zero.';
  }
  if (isFuture(values.date)) {
    errors.date = 'A data não pode ser futura.';
  }
  return errors;
}

export default function GerenciarTreino({ route, navigation }) {
  const { colors } = useTheme();
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();

  const workoutId = route.params?.workoutId;
  const preset = route.params?.preset;
  const isEditing = Boolean(workoutId);
  const editing = isEditing ? workouts.find((w) => w.id === workoutId) : null;

  // Estado único do formulário.
  const [form, setForm] = useState(() => ({
    exercise: editing?.exercise ?? preset?.exercise ?? '',
    muscle: editing?.muscle ?? preset?.muscle ?? '',
    sets: String(editing?.sets ?? preset?.sets ?? ''),
    reps: String(editing?.reps ?? preset?.reps ?? ''),
    date: editing ? new Date(editing.date) : new Date(),
  }));
  const [errors, setErrors] = useState({});
  const [muscleModal, setMuscleModal] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  function handleChange(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    // Mantém só os erros que ainda são válidos: o que foi corrigido some, o resto permanece.
    setErrors((prev) => {
      const current = validate(next);
      const kept = {};
      Object.keys(prev).forEach((key) => {
        if (current[key]) kept[key] = current[key];
      });
      return kept;
    });
  }

  function handleNumeric(field, text) {
    if (/^\d{0,3}$/.test(text)) handleChange(field, text);
  }

  function confirmDelete() {
    Alert.alert('Excluir treino', 'Tem certeza que deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(workoutId);
          navigation.goBack();
        },
      },
    ]);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar treino' : 'Novo treino',
      headerRight: isEditing
        ? () => <Ionicons name="trash-outline" size={24} color={colors.error} onPress={confirmDelete} />
        : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isEditing, colors.error]);

  // Se o treino editado deixar de existir, volta para a lista.
  useEffect(() => {
    if (isEditing && !editing) navigation.goBack();
  }, [isEditing, editing, navigation]);

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {
        // Haptics pode não existir em alguns aparelhos/emuladores.
      }
      return;
    }

    const data = {
      exercise: form.exercise.trim(),
      muscle: form.muscle,
      group: groupOfMuscle(form.muscle),
      sets: parseInt(form.sets, 10),
      reps: parseInt(form.reps, 10),
      date: form.date.toISOString(),
    };

    if (isEditing) updateWorkout(workoutId, data);
    else addWorkout(data);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // ignora
    }
    navigation.goBack();
  }

  if (isEditing && !editing) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CampoTexto
          label="Exercício"
          value={form.exercise}
          onChangeText={(t) => handleChange('exercise', t)}
          placeholder="Ex.: Supino reto"
          error={errors.exercise}
        />

        <CampoSeletor
          label="Músculo"
          value={form.muscle}
          placeholder="Selecione o músculo"
          error={errors.muscle}
          onPress={() => setMuscleModal(true)}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <CampoTexto
              label="Séries"
              value={form.sets}
              onChangeText={(t) => handleNumeric('sets', t)}
              keyboardType="number-pad"
              placeholder="3"
              error={errors.sets}
            />
          </View>
          <View style={styles.half}>
            <CampoTexto
              label="Repetições"
              value={form.reps}
              onChangeText={(t) => handleNumeric('reps', t)}
              keyboardType="number-pad"
              placeholder="12"
              error={errors.reps}
            />
          </View>
        </View>

        {Platform.OS === 'ios' ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 6 }}>Data</Text>
            <View style={{ alignItems: 'flex-start' }}>
              <DateTimePicker
                value={form.date}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                onChange={(event, selected) => selected && handleChange('date', selected)}
              />
            </View>
            {errors.date ? <Text style={{ color: colors.error, fontSize: 13, marginTop: 4 }}>{errors.date}</Text> : null}
          </View>
        ) : (
          <>
            <CampoSeletor
              label="Data"
              value={formatDate(form.date)}
              icon="calendar-outline"
              error={errors.date}
              onPress={() => setShowAndroidPicker(true)}
            />
            {showAndroidPicker ? (
              <DateTimePicker
                value={form.date}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selected) => {
                  setShowAndroidPicker(false);
                  if (event.type === 'set' && selected) handleChange('date', selected);
                }}
              />
            ) : null}
          </>
        )}

        <Botao title={isEditing ? 'Salvar alterações' : 'Salvar treino'} icon="save-outline" onPress={handleSave} />
        <Botao title="Cancelar" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
      </ScrollView>

      <SeletorModal
        visible={muscleModal}
        title="Escolha o músculo"
        options={MUSCLE_OPTIONS}
        selected={form.muscle}
        onClose={() => setMuscleModal(false)}
        onSelect={(value) => {
          handleChange('muscle', value);
          setMuscleModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
