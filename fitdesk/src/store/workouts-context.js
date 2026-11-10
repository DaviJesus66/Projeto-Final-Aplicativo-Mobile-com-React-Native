import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import {
  createWorkout,
  editWorkout,
  removeAllWorkouts,
  removeWorkout,
  subscribeWorkouts,
} from '../services/workoutsService';

// Modelo de cada treino: { id, exercise, group, muscle, sets, reps, date }
// O Firestore é a fonte da verdade: as telas escrevem pelos serviços e o
// onSnapshot devolve a lista atualizada, que entra no estado por SET.
export function workoutsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state];
    case 'UPDATE':
      return state.map((w) =>
        w.id === action.payload.id ? { ...w, ...action.payload.data } : w
      );
    case 'DELETE':
      return state.filter((w) => w.id !== action.payload);
    case 'SET':
      return action.payload;
    default:
      return state;
  }
}

const WorkoutsContext = createContext(null);

export function WorkoutsContextProvider({ children }) {
  const [workouts, dispatch] = useReducer(workoutsReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeWorkouts(
      (list) => {
        dispatch({ type: 'SET', payload: list });
        setError(null);
        setIsLoaded(true);
      },
      (err) => {
        console.warn('Falha ao ler os treinos do Firestore:', err);
        setError('Não foi possível carregar os treinos. Verifique a conexão.');
        setIsLoaded(true);
      }
    );
    return unsubscribe;
  }, []);

  // Não usamos await nas telas: com o Firestore offline a promise só resolve ao reconectar.
  const run = useCallback((promise, message) => {
    promise.catch((err) => {
      console.warn(message, err);
      setError(message);
    });
  }, []);

  const addWorkout = useCallback((data) => run(createWorkout(data), 'Não foi possível salvar o treino.'), [run]);
  const updateWorkout = useCallback((id, data) => run(editWorkout(id, data), 'Não foi possível atualizar o treino.'), [run]);
  const deleteWorkout = useCallback((id) => run(removeWorkout(id), 'Não foi possível excluir o treino.'), [run]);
  const clearWorkouts = useCallback(() => run(removeAllWorkouts(), 'Não foi possível limpar os treinos.'), [run]);
  const clearError = useCallback(() => setError(null), []);

  const sorted = useMemo(
    () => [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [workouts]
  );

  const value = useMemo(
    () => ({ workouts: sorted, isLoaded, error, clearError, addWorkout, updateWorkout, deleteWorkout, clearWorkouts }),
    [sorted, isLoaded, error, clearError, addWorkout, updateWorkout, deleteWorkout, clearWorkouts]
  );

  return <WorkoutsContext.Provider value={value}>{children}</WorkoutsContext.Provider>;
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) {
    throw new Error('useWorkouts deve ser usado dentro de um WorkoutsContextProvider.');
  }
  return ctx;
}
