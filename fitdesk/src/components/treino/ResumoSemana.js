import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { cardShadow, radius } from '../../constants/theme';
import { WEEKDAYS_SHORT, sameDay } from '../../utils/date';

// Mostra os últimos 7 dias, marcando em quais deles houve treino e quais músculos foram trabalhados.
export default function ResumoSemana({ workouts }) {
  const { colors } = useTheme();

  const days = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const muscles = [...new Set(workouts.filter((w) => sameDay(w.date, date)).map((w) => w.muscle))];
      list.push({ key: date.toDateString(), label: WEEKDAYS_SHORT[date.getDay()], muscles, isToday: i === 0 });
    }
    return list;
  }, [workouts]);

  const trained = days.filter((d) => d.muscles.length > 0);

  return (
    <View style={[styles.box, cardShadow, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Você treinou {trained.length} de 7 dias
      </Text>
      <View style={styles.row}>
        {days.map((d) => (
          <View key={d.key} style={styles.day}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: d.muscles.length ? colors.primary : colors.chip,
                  borderColor: d.isToday ? colors.primary : 'transparent',
                },
              ]}
            >
              {d.muscles.length ? <Ionicons name="checkmark" size={18} color={colors.onPrimary} /> : null}
            </View>
            <Text style={{ color: d.isToday ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: '600' }}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
      {trained.map((d) => (
        <Text key={d.key} style={{ color: colors.textMuted, marginTop: 4 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{d.label}: </Text>
          {d.muscles.join(', ')}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 14, marginHorizontal: 6, marginBottom: 10, borderRadius: radius.md },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  day: { alignItems: 'center' },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
});
