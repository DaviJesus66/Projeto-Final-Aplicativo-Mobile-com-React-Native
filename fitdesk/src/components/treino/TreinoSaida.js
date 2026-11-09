import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TreinoLista from './TreinoLista';

// Liga a lista à navegação (toque abre a edição) e adapta as colunas à largura da tela.
export default function TreinoSaida({ workouts, headerExtra, emptyTitle, emptyMessage }) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const columns = width > 600 ? 2 : 1;

  return (
    <TreinoLista
      workouts={workouts}
      columns={columns}
      headerExtra={headerExtra}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      onPressItem={(workoutId) => navigation.navigate('GerenciarTreino', { workoutId })}
    />
  );
}
