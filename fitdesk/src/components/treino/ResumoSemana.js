
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { cardShadow, radius } from '../../constants/theme';
import { WEEKDAYS_SHORT, sameDay } from '../../utils/date';
import { GROUPS } from '../../constants/workouts';

export default function ResumoSemana({ workouts }) {
  const { colors } = useTheme();

  const days = useMemo(() => {
    const list = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayWorkouts = workouts.filter((w) =>
        sameDay(w.date, date)
      );

      list.push({
        key: date.toDateString(),
        label: WEEKDAYS_SHORT[date.getDay()],
        count: dayWorkouts.length,
        muscles: [...new Set(dayWorkouts.map((w) => w.muscle).filter(Boolean))],
        isToday: i === 0,
      });
    }

    return list;
  }, [workouts]);

  const totalWeek = days.reduce((sum, day) => sum + day.count, 0);
  const trained = days.filter((day) => day.count > 0);

  const muscleGroups = GROUPS.map((group) => {
    const count = workouts.filter(
      (workout) =>
        group.muscles.includes(workout.muscle) &&
        days.some((day) => day.key === new Date(workout.date).toDateString())
    ).length;

    return { ...group, count };
  });

  return (
    <View style={[styles.box, cardShadow, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Resumo dos últimos 7 dias
      </Text>

      <View style={styles.totalBox}>
        <Text style={[styles.total, { color: colors.primary }]}>
          {totalWeek}
        </Text>
        <Text style={{ color: colors.textMuted }}>
          treinos realizados
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        Treinos por dia
      </Text>

      <View style={styles.row}>
        {days.map((day) => (
          <View key={day.key} style={styles.day}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: day.count > 0 ? colors.primary : colors.chip,
                  borderColor: day.isToday ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                style={{
                  color: day.count > 0 ? colors.onPrimary : colors.textMuted,
                  fontWeight: '700',
                }}
              >
                {day.count}
              </Text>
            </View>

            <Text
              style={{
                color: day.isToday ? colors.primary : colors.textMuted,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        Grupos musculares
      </Text>

      {muscleGroups.map((group) => (
        <View key={group.id} style={styles.groupRow}>
          <View style={styles.groupInfo}>
            <Ionicons name={group.icon} size={20} color={colors.primary} />

            <Text style={[styles.groupLabel, { color: colors.text }]}>
              {group.label}
            </Text>

            <Text style={[styles.groupCount, { color: colors.primary }]}>
              {group.count}
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: colors.chip }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${totalWeek > 0 ? (group.count / totalWeek) * 100 : 0}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.progressCaption, { color: colors.textMuted }]}>
            {totalWeek > 0
              ? `${Math.round((group.count / totalWeek) * 100)}% dos treinos`
              : 'Nenhum treino registrado'}
          </Text>
        </View>
      ))}

      {trained.length > 0 && (
        <View style={styles.details}>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Músculos trabalhados
          </Text>

          {trained.map((day) => (
            <Text
              key={day.key}
              style={[styles.muscleText, { color: colors.textMuted }]}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {day.label}:{' '}
              </Text>
              {day.muscles.join(', ') || 'Não informado'}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 14,
    marginHorizontal: 6,
    marginBottom: 10,
    borderRadius: radius.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  totalBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  total: {
    fontSize: 32,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  day: {
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  groupRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cccccc',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupLabel: {
    flex: 1,
    marginLeft: 8,
  },
  groupCount: {
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressCaption: {
    fontSize: 11,
    marginTop: 4,
  },
  details: {
    marginTop: 4,
  },
  muscleText: {
    marginTop: 5,
  },
});
