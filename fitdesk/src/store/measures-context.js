import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newId } from '../utils/date';

const STORAGE_KEY = '@measures';

// Cada medição: { id, weight (kg), height (cm), date }
export function measuresReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state];
    case 'DELETE':
      return state.filter((m) => m.id !== action.payload);
    case 'SET':
      return action.payload;
    default:
      return state;
  }
}

const MeasuresContext = createContext(null);

export function MeasuresContextProvider({ children }) {
  const [measures, dispatch] = useReducer(measuresReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

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
        console.warn('Falha ao ler as medidas salvas:', error);
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    async function save() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(measures));
      } catch (error) {
        console.warn('Falha ao salvar as medidas:', error);
      }
    }
    save();
  }, [measures, isLoaded]);

  const addMeasure = useCallback((data) => {
    dispatch({ type: 'ADD', payload: { id: newId(), date: new Date().toISOString(), ...data } });
  }, []);
  const deleteMeasure = useCallback((id) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const sorted = useMemo(
    () => [...measures].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [measures]
  );

  const value = useMemo(
    () => ({ measures: sorted, isLoaded, addMeasure, deleteMeasure }),
    [sorted, isLoaded, addMeasure, deleteMeasure]
  );

  return <MeasuresContext.Provider value={value}>{children}</MeasuresContext.Provider>;
}

export function useMeasures() {
  const ctx = useContext(MeasuresContext);
  if (!ctx) {
    throw new Error('useMeasures deve ser usado dentro de um MeasuresContextProvider.');
  }
  return ctx;
}
