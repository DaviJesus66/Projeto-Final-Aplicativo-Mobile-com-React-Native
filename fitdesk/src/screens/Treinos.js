import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '../store/workouts-context';
import { useTheme } from '../store/theme-context';
import useDebounce from '../hooks/useDebounce';
import TreinoSaida from '../components/treino/TreinoSaida';
import ResumoSemana from '../components/treino/ResumoSemana';
import Chip from '../components/ui/Chip';
import { GROUPS } from '../constants/workouts';
import { radius } from '../constants/theme';
import { isWithinLastDays } from '../utils/date';

// Une o antigo Histórico e a antiga Semana: período (7 dias ou todos), busca e filtro por grupo.
export default function Treinos() {
  const { workouts } = useWorkouts();
  const { colors } = useTheme();
  const [periodo, setPeriodo] = useState('semana'); // 'semana' | 'todos'
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const recentes = useMemo(() => workouts.filter((w) => isWithinLastDays(w.date, 7)), [workouts]);

  // Período + busca por exercício ou músculo (sem diferenciar maiúsculas) + filtro de grupo.
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const base = periodo === 'semana' ? recentes : workouts;
    return base.filter((w) => {
      const matchGroup = !groupFilter || w.group === groupFilter;
      const matchText =
        !term ||
        String(w.exercise || '').toLowerCase().includes(term) ||
        String(w.muscle || '').toLowerCase().includes(term);
      return matchGroup && matchText;
    });
  }, [workouts, recentes, periodo, debouncedSearch, groupFilter]);

  const hasFilter = debouncedSearch.trim() !== '' || groupFilter !== null;
  const naSemana = periodo === 'semana';

  let emptyTitle = 'Nenhum treino registrado';
  let emptyMessage = 'Escolha um exercício na aba Treinar ou toque em + para adicionar.';
  if (hasFilter) {
    emptyTitle = 'Nenhum treino encontrado';
    emptyMessage = 'Tente outro termo ou remova os filtros.';
  } else if (naSemana) {
    emptyTitle = 'Sem treinos nos últimos 7 dias';
    emptyMessage = 'Escolha um exercício na aba Treinar e registre o seu treino.';
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar exercício ou músculo..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
          />
          {search ? (
            <Ionicons name="close-circle" size={18} color={colors.textMuted} onPress={() => setSearch('')} />
          ) : null}
        </View>
        <View style={styles.chips}>
          <Chip label="Últimos 7 dias" selected={naSemana} onPress={() => setPeriodo('semana')} />
          <Chip label="Todos" selected={!naSemana} onPress={() => setPeriodo('todos')} />
        </View>
        <View style={styles.chips}>
          <Chip label="Todos os grupos" selected={groupFilter === null} onPress={() => setGroupFilter(null)} />
          {GROUPS.map((g) => (
            <Chip
              key={g.id}
              label={g.id === 'superiores' ? 'Superiores' : 'Inferiores'}
              selected={groupFilter === g.id}
              onPress={() => setGroupFilter(groupFilter === g.id ? null : g.id)}
            />
          ))}
        </View>
      </View>
      <TreinoSaida
        workouts={filtered}
        headerExtra={naSemana ? <ResumoSemana workouts={recentes} /> : null}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
