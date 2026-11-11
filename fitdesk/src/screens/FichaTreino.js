import React, { useLayoutEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/theme-context';
import { useWorkouts } from '../store/workouts-context';
import { EXERCISES } from '../constants/workouts';
import { cardShadow, radius } from '../constants/theme';
import { sameDay } from '../utils/date';

export default function FichaTreino({ route, navigation }) {
  const { colors } = useTheme();
  const { workouts } = useWorkouts();
  const { group, muscle } = route.params;
  const exercises = EXERCISES[muscle] || [];

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Ficha de ${muscle}` });
  }, [navigation, muscle]);


  const feitosHoje = useMemo(() => {
    const hoje = new Date();
    return new Set(workouts.filter((w) => sameDay(w.date, hoje)).map((w) => w.exercise));
  }, [workouts]);

  const total = exercises.length;
  const concluidos = exercises.filter((e) => feitosHoje.has(e.name)).length;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={exercises}
      keyExtractor={(item) => item.name}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
            Hoje: {concluidos} de {total} exercícios feitos
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 2 }}>
            Toque em um exercício para executar as séries.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const feito = feitosHoje.has(item.name);
        return (
          <Pressable
            onPress={() =>
              navigation.navigate('ExecutarExercicio', {
                exercise: item.name,
                group,
                muscle,
                sets: item.sets,
                reps: item.reps,
              })
            }
            style={({ pressed }) => [styles.card, cardShadow, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 2 }}>
                {item.sets} séries × {item.reps} repetições
              </Text>
            </View>
            <Ionicons
              name={feito ? 'checkmark-circle' : 'play-circle'}
              size={32}
              color={feito ? colors.success : colors.primary}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10, borderRadius: radius.md },
});
