import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMeasures } from '../store/measures-context';
import { useTheme } from '../store/theme-context';
import { CampoTexto } from '../components/ui/Campo';
import Botao from '../components/ui/Botao';
import { cardShadow, radius } from '../constants/theme';
import { formatDate } from '../utils/date';
import { calcImc, monthlyVariation } from '../utils/measures';

function validate(values) {
  const errors = {};
  const weight = parseFloat(values.weight);
  const height = parseInt(values.height, 10);
  if (!(weight >= 20 && weight <= 400)) errors.weight = 'Informe um peso entre 20 e 400 kg.';
  if (!(height >= 100 && height <= 250)) errors.height = 'Informe uma altura entre 100 e 250 cm.';
  return errors;
}

export default function PesoAltura() {
  const { colors } = useTheme();
  const { measures, addMeasure, deleteMeasure } = useMeasures();
  const last = measures[0];

  const [form, setForm] = useState({ weight: '', height: last ? String(last.height) : '' });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    setErrors((prev) => {
      const current = validate(next);
      const kept = {};
      Object.keys(prev).forEach((key) => {
        if (current[key]) kept[key] = current[key];
      });
      return kept;
    });
  }

  function handleWeight(text) {
    const clean = text.replace(',', '.');
    if (/^\d{0,3}\.?\d{0,1}$/.test(clean)) handleChange('weight', clean);
  }

  function handleHeight(text) {
    if (/^\d{0,3}$/.test(text)) handleChange('height', text);
  }

  async function handleSave() {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    addMeasure({ weight: parseFloat(form.weight), height: parseInt(form.height, 10) });
    setForm((prev) => ({ ...prev, weight: '' }));
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // ignora
    }
    Alert.alert('Medida salva', 'Seu peso e sua altura foram atualizados.');
  }

  function confirmDelete(id) {
    Alert.alert('Excluir medida', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteMeasure(id) },
    ]);
  }

  const variation = monthlyVariation(measures);
  const imc = last ? calcImc(last.weight, last.height) : null;
  const variationColor = variation === null ? colors.textMuted : variation > 0 ? colors.warning : colors.success;
  const variationText =
    variation === null
      ? 'Registre mais uma medida neste mês para ver a variação.'
      : variation === 0
      ? 'Peso estável neste mês'
      : `${variation > 0 ? '+' : ''}${variation.toString().replace('.', ',')} kg neste mês`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, cardShadow, { backgroundColor: colors.card }]}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {last ? String(last.weight).replace('.', ',') : '--'}
              </Text>
              <Text style={{ color: colors.textMuted }}>kg</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{last ? last.height : '--'}</Text>
              <Text style={{ color: colors.textMuted }}>cm</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {imc ? String(imc).replace('.', ',') : '--'}
              </Text>
              <Text style={{ color: colors.textMuted }}>IMC</Text>
            </View>
          </View>
          <View style={styles.variation}>
            <Ionicons
              name={variation === null || variation === 0 ? 'remove-circle-outline' : variation > 0 ? 'trending-up' : 'trending-down'}
              size={20}
              color={variationColor}
            />
            <Text style={{ color: variationColor, fontWeight: '700', marginLeft: 8, flex: 1 }}>{variationText}</Text>
          </View>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Nova medida</Text>
        <CampoTexto
          label="Peso (kg)"
          value={form.weight}
          onChangeText={handleWeight}
          keyboardType="decimal-pad"
          placeholder="Ex.: 72.5"
          error={errors.weight}
        />
        <CampoTexto
          label="Altura (cm)"
          value={form.height}
          onChangeText={handleHeight}
          keyboardType="number-pad"
          placeholder="Ex.: 175"
          error={errors.height}
        />
        <Botao title="Salvar medida" icon="save-outline" onPress={handleSave} />

        <Text style={[styles.heading, { color: colors.text, marginTop: 28 }]}>Histórico</Text>
        {measures.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Nenhuma medida registrada ainda.</Text>
        ) : (
          measures.map((m) => (
            <View key={m.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {String(m.weight).replace('.', ',')} kg · {m.height} cm
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(m.date)}</Text>
              </View>
              <Ionicons name="trash-outline" size={20} color={colors.error} onPress={() => confirmDelete(m.id)} />
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: { padding: 16, borderRadius: radius.lg, marginBottom: 20 },
  stats: { flexDirection: 'row', marginBottom: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  variation: { flexDirection: 'row', alignItems: 'center' },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
