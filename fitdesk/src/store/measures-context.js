import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { newId } from '../utils/date';
import { excluirDoc, observarColecao, salvarDoc } from '../services/repositorio';

const COLECAO = 'measures';

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
    const cancelar = observarColecao(
      COLECAO,
      (lista) => {
        dispatch({ type: 'SET', payload: lista });
        setIsLoaded(true);
      },
      (error) => {
        console.warn('Falha ao ler as medidas do Firestore:', error);
        setIsLoaded(true);
      }
    );
    return cancelar;
  }, []);

  const addMeasure = useCallback((data) => {
    salvarDoc(COLECAO, newId(), { date: new Date().toISOString(), ...data }).catch((error) =>
      console.warn('Falha ao salvar a medida:', error)
    );
  }, []);
  const deleteMeasure = useCallback((id) => {
    excluirDoc(COLECAO, id).catch((error) =>
      console.warn('Falha ao excluir a medida:', error)
    );
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
