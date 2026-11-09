import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/theme-context';
import { GROUPS, EXERCISES } from '../constants/workouts';
import { cardShadow, radius } from '../constants/theme';

export default function EscolherFoco({ navigation }) {
  const { colors } = useTheme();
  const [groupId, setGroupId] = useState(null);
  const group = GROUPS.find((g) => g.id === groupId);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: colors.text }]}>Qual é o foco do treino de hoje?</Text>

      <View style={styles.groups}>
        {GROUPS.map((g) => {
          const selected = g.id === groupId;
          return (
            <Pressable
              key={g.id}
              onPress={() => setGroupId(g.id)}
              style={[
                styles.groupCard,
                cardShadow,
                { backgroundColor: selected ? colors.primary : colors.card },
              ]}
            >
              <Ionicons name={g.icon} size={40} color={selected ? colors.onPrimary : colors.primary} />
              <Text style={[styles.groupLabel, { color: selected ? colors.onPrimary : colors.text }]}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {group ? (
        <View>
          <Text style={[styles.subheading, { color: colors.text }]}>Escolha o músculo</Text>
          {group.muscles.map((muscle) => (
            <Pressable
              key={muscle}
              onPress={() => navigation.navigate('FichaTreino', { group: group.id, muscle })}
              style={({ pressed }) => [
                styles.muscleRow,
                cardShadow,
                { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{muscle}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  {EXERCISES[muscle].length} exercícios na ficha
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>
          Selecione membros superiores ou inferiores para ver os músculos.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  subheading: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  groups: { flexDirection: 'row', gap: 12 },
  groupCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
  },
  groupLabel: { marginTop: 10, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderRadius: radius.md,
  },
});
