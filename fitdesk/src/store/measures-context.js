import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { createMeasure, removeMeasure, subscribeMeasures } from '../services/measuresService';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeMeasures(
      (list) => {
        dispatch({ type: 'SET', payload: list });
        setError(null);
        setIsLoaded(true);
      },
      (err) => {
        console.warn('Falha ao ler as medidas do Firestore:', err);
        setError('Não foi possível carregar as medidas. Verifique a conexão.');
        setIsLoaded(true);
      }
    );
    return unsubscribe;
  }, []);

  const addMeasure = useCallback((data) => {
    createMeasure({ date: new Date().toISOString(), ...data }).catch((err) => {
      console.warn('Falha ao salvar a medida:', err);
      setError('Não foi possível salvar a medida.');
    });
  }, []);

  const deleteMeasure = useCallback((id) => {
    removeMeasure(id).catch((err) => {
      console.warn('Falha ao excluir a medida:', err);
      setError('Não foi possível excluir a medida.');
    });
  }, []);

  const sorted = useMemo(
    () => [...measures].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [measures]
  );

  const value = useMemo(
    () => ({ measures: sorted, isLoaded, error, addMeasure, deleteMeasure }),
    [sorted, isLoaded, error, addMeasure, deleteMeasure]
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
