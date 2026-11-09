import React, { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/theme-context';
import { EXERCISES } from '../constants/workouts';
import { cardShadow, radius } from '../constants/theme';

export default function FichaTreino({ route, navigation }) {
  const { colors } = useTheme();
  const { group, muscle } = route.params;
  const exercises = EXERCISES[muscle] || [];

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Ficha de ${muscle}` });
  }, [navigation, muscle]);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={exercises}
      keyExtractor={(item) => item.name}
      ListHeaderComponent={
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
          Toque em um exercício para registrar o treino de hoje.
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            navigation.navigate('GerenciarTreino', {
              preset: { exercise: item.name, group, muscle, sets: item.sets, reps: item.reps },
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
          <Ionicons name="play-circle" size={32} color={colors.primary} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10, borderRadius: radius.md },
});
