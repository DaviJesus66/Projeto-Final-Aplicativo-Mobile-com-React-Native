import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import TreinoItem from './TreinoItem';
import TreinoSumario from './TreinoSumario';
import EstadoVazio from '../ui/EstadoVazio';

export default function TreinoLista({ workouts, onPressItem, columns = 1, headerExtra, emptyTitle, emptyMessage }) {
  return (
    <FlatList
      // numColumns não pode mudar sem trocar a key da lista.
      key={`cols-${columns}`}
      data={workouts}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      renderItem={({ item }) => (
        <View style={{ width: `${100 / columns}%` }}>
          <TreinoItem workout={item} onPress={onPressItem} />
        </View>
      )}
      ListHeaderComponent={
        <View>
          {headerExtra}
          <TreinoSumario workouts={workouts} />
        </View>
      }
      ListEmptyComponent={
        <EstadoVazio icon="barbell-outline" title={emptyTitle} message={emptyMessage} />
      }
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
});
