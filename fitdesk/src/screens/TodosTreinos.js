import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '../store/workouts-context';
import { useTheme } from '../store/theme-context';
import useDebounce from '../hooks/useDebounce';
import TreinoSaida from '../components/treino/TreinoSaida';
import Chip from '../components/ui/Chip';
import { GROUPS } from '../constants/workouts';
import { radius } from '../constants/theme';

export default function TodosTreinos() {
  const { workouts } = useWorkouts();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  // Busca por exercício ou músculo (sem diferenciar maiúsculas) combinada com o filtro de grupo.
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return workouts.filter((w) => {
      const matchGroup = !groupFilter || w.group === groupFilter;
      const matchText =
        !term || w.exercise.toLowerCase().includes(term) || w.muscle.toLowerCase().includes(term);
      return matchGroup && matchText;
    });
  }, [workouts, debouncedSearch, groupFilter]);

  const hasFilter = debouncedSearch.trim() !== '' || groupFilter !== null;

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
          <Chip label="Todos" selected={groupFilter === null} onPress={() => setGroupFilter(null)} />
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
        emptyTitle={hasFilter ? 'Nenhum treino encontrado' : 'Nenhum treino registrado'}
        emptyMessage={
          hasFilter
            ? 'Tente outro termo ou remova os filtros.'
            : 'Toque em + para adicionar ou escolha um exercício na aba Treinar.'
        }
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
