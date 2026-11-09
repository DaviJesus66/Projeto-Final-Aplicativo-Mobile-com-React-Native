import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { cardShadow, radius } from '../../constants/theme';
import { groupById } from '../../constants/workouts';
import { formatDate } from '../../utils/date';

export default function TreinoItem({ workout, onPress }) {
  const { colors } = useTheme();
  const group = groupById(workout.group);

  return (
    <Pressable
      onPress={() => onPress(workout.id)}
      style={({ pressed }) => [
        styles.card,
        cardShadow,
        { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.chip }]}>
        <Ionicons name={group ? group.icon : 'barbell-outline'} size={22} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {workout.exercise}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          {workout.muscle} · {formatDate(workout.date)}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>
          {workout.sets}×{workout.reps}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 6,
    borderRadius: radius.md,
  },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 16, fontWeight: '700' },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.sm },
});
