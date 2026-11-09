import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newId } from '../utils/date';

const STORAGE_KEY = '@workouts';

// Modelo de cada treino registrado: { id, exercise, group, muscle, sets, reps, date }
// O reducer sempre devolve um novo array (sem push, splice ou mutação direta).
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

  // Carrega os dados salvos ao iniciar e dispara SET.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved)) dispatch({ type: 'SET', payload: saved });
        }
      } catch (error) {
        console.warn('Falha ao ler os treinos salvos:', error);
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Salva a cada alteração, mas só depois do carregamento inicial
  // (evita sobrescrever os dados salvos com a lista vazia).
  useEffect(() => {
    if (!isLoaded) return;
    async function save() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
      } catch (error) {
        console.warn('Falha ao salvar os treinos:', error);
      }
    }
    save();
  }, [workouts, isLoaded]);

  const addWorkout = useCallback((data) => {
    dispatch({ type: 'ADD', payload: { id: newId(), ...data } });
  }, []);
  const updateWorkout = useCallback((id, data) => {
    dispatch({ type: 'UPDATE', payload: { id, data } });
  }, []);
  const deleteWorkout = useCallback((id) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);
  const clearWorkouts = useCallback(() => {
    dispatch({ type: 'SET', payload: [] });
  }, []);

  // Sempre do mais recente para o mais antigo.
  const sorted = useMemo(
    () => [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [workouts]
  );

  const value = useMemo(
    () => ({ workouts: sorted, isLoaded, addWorkout, updateWorkout, deleteWorkout, clearWorkouts }),
    [sorted, isLoaded, addWorkout, updateWorkout, deleteWorkout, clearWorkouts]
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
